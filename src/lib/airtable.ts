import { sampleProducts } from "@/data/sample-products";
import { sendRegistryOrderNotification } from "@/lib/email";
import { calculateAvailableQuantity } from "@/lib/inventory";
import { generateOrderId } from "@/lib/order-id";
import { getPaymentOption, paymentMethodLabels } from "@/lib/payments";
import type {
  CheckoutRequest,
  OrderSummary,
  OrderSummaryItem,
  PaymentMethod,
  Product,
} from "@/types/store";

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

type AirtableListResponse = {
  records: AirtableRecord[];
  offset?: string;
};

type AirtableCreateResponse = {
  records: Array<{
    id: string;
  }>;
};

type ValidatedLineItem = {
  product: Product;
  quantity: number;
  lineTotalCents: number;
};

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

const airtableConfig = {
  apiToken: process.env.AIRTABLE_API_TOKEN,
  baseId: process.env.AIRTABLE_BASE_ID,
  productsTable: process.env.AIRTABLE_PRODUCTS_TABLE ?? "Products",
  ordersTable: process.env.AIRTABLE_ORDERS_TABLE ?? "Orders",
  orderItemsTable: process.env.AIRTABLE_ORDER_ITEMS_TABLE ?? "Order Items",
};

export function isAirtableConfigured() {
  return Boolean(airtableConfig.apiToken && airtableConfig.baseId);
}

function getValidPaymentMethod(method: PaymentMethod) {
  if (!Object.keys(paymentMethodLabels).includes(method)) {
    throw new Error("Choose a valid payment method.");
  }

  return method;
}
export async function getPublicProducts(): Promise<Product[]> {
  if (!isAirtableConfigured()) {
    return sampleProducts;
  }

  try {
    const records = await listAirtableRecords(airtableConfig.productsTable);
    const products = records.map(mapAirtableProduct).filter((product) => product.isActive);

    return products.length > 0 ? products : sampleProducts;
  } catch (error) {
    console.error("Unable to load Airtable products.", error);
    return sampleProducts;
  }
}

export async function createOrderFromCheckout(
  checkout: CheckoutRequest,
): Promise<OrderSummary> {
  const products = await getPublicProducts();
  const lineItems = validateCheckout(checkout, products);
  const orderId = generateOrderId();
  const subtotalCents = lineItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
  const feesCents = 0;
  const totalCents = subtotalCents + feesCents;
  const payment = getPaymentOption(
    getValidPaymentMethod(checkout.customer.paymentMethod),
    checkout.customer.registryUserName,
  );
  const summaryItems: OrderSummaryItem[] = lineItems.map((item) => ({
    productId: item.product.id,
    name: item.product.name,
    quantity: item.quantity,
    unitPriceCents: item.product.priceCents,
    lineTotalCents: item.lineTotalCents,
  }));

  const summary: OrderSummary = {
    orderId,
    items: summaryItems,
    subtotalCents,
    feesCents,
    totalCents,
    paymentMethod: payment.method,
    paymentMethodLabel: payment.label,
    paymentRecipient: payment.recipient,
    paymentUrl: payment.url,
    paymentQrImageUrl: payment.qrImageUrl,
    paymentNote: payment.note,
    checkMailingAddress: payment.checkMailingAddress,
    paymentStatus: "Pending Payment",
  };

  if (isAirtableConfigured()) {
    await createAirtableOrder(checkout, summary, lineItems);
  }

  await notifyRegistryOrder(checkout, lineItems);

  return summary;
}

async function notifyRegistryOrder(
  checkout: CheckoutRequest,
  lineItems: ValidatedLineItem[],
) {
  try {
    await sendRegistryOrderNotification({
      customerName: checkout.customer.registryUserName,
      items: lineItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
      })),
    });
  } catch (error) {
    console.error("Unable to send registry email notification.", error);
  }
}

function validateCheckout(checkout: CheckoutRequest, products: Product[]) {
  if (!checkout.customer?.name?.trim()) {
    throw new Error("Customer name is required.");
  }

  if (!checkout.customer?.email?.trim()) {
    throw new Error("Customer email is required.");
  }
  getValidPaymentMethod(checkout.customer.paymentMethod);

  if (!Array.isArray(checkout.items) || checkout.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const productsById = new Map(products.map((product) => [product.id, product]));
  const mergedItems = new Map<string, number>();

  for (const item of checkout.items) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Cart contains an invalid item.");
    }

    if (item.quantity > 99) {
      throw new Error("Cart item quantity is too high.");
    }

    mergedItems.set(item.productId, (mergedItems.get(item.productId) ?? 0) + item.quantity);
  }

  return Array.from(mergedItems.entries()).map(([productId, quantity]) => {
    const product = productsById.get(productId);

    if (!product || !product.isActive) {
      throw new Error("One or more products are no longer available.");
    }

    if (product.availableQuantity < quantity) {
      throw new Error(`${product.name} only has ${product.availableQuantity} available.`);
    }

    return {
      product,
      quantity,
      lineTotalCents: product.priceCents * quantity,
    };
  });
}

async function listAirtableRecords(tableName: string) {
  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams({ pageSize: "100" });

    if (offset) {
      params.set("offset", offset);
    }

    const response = await airtableFetch<AirtableListResponse>(
      tableName,
      `?${params.toString()}`,
    );

    records.push(...response.records);
    offset = response.offset;
  } while (offset);

  return records;
}

async function createAirtableOrder(
  checkout: CheckoutRequest,
  summary: OrderSummary,
  lineItems: ValidatedLineItem[],
) {
  const orderRecord = await airtableFetch<AirtableCreateResponse>(airtableConfig.ordersTable, "", {
    method: "POST",
    body: JSON.stringify({
      records: [
        {
          fields: {
            "Order ID": summary.orderId,
            "Customer Name": checkout.customer.name,
            Email: checkout.customer.email,
            Phone: checkout.customer.phone,
            Notes: checkout.customer.notes,
            "Subtotal Cents": summary.subtotalCents,
            "Fees Cents": summary.feesCents,
            "Total Cents": summary.totalCents,
            "Payment Method": summary.paymentMethodLabel,
            "Payment Status": summary.paymentStatus,
            "Fulfillment Status": "Not Fulfilled",
            "Payment Note": summary.paymentNote,
          },
        },
      ],
    }),
  });

  const createdOrderId = orderRecord.records[0]?.id ?? "";

  if (!createdOrderId) {
    throw new Error("Airtable did not return an order record ID.");
  }

  await createAirtableOrderItems(createdOrderId, lineItems);
  await reserveAirtableInventory(lineItems);
}

async function createAirtableOrderItems(
  airtableOrderRecordId: string,
  lineItems: ValidatedLineItem[],
) {
  const records = lineItems.map((item) => ({
    fields: {
      Order: [airtableOrderRecordId],
      Product: item.product.airtableRecordId ? [item.product.airtableRecordId] : undefined,
      "Product ID": item.product.id,
      "Product Name": item.product.name,
      Quantity: item.quantity,
      "Unit Price Cents": item.product.priceCents,
      "Line Total Cents": item.lineTotalCents,
    },
  }));

  for (const chunk of chunkRecords(records, 10)) {
    await airtableFetch(airtableConfig.orderItemsTable, "", {
      method: "POST",
      body: JSON.stringify({ records: chunk }),
    });
  }
}

async function reserveAirtableInventory(lineItems: ValidatedLineItem[]) {
  const records = lineItems
    .filter((item) => item.product.airtableRecordId)
    .map((item) => {
      const reservedQuantity = item.product.reservedQuantity + item.quantity;

      return {
        id: item.product.airtableRecordId,
        fields: {
          "Reserved Quantity": reservedQuantity,
          "Available Quantity": calculateAvailableQuantity({
            totalInventory: item.product.totalInventory,
            reservedQuantity,
            soldQuantity: item.product.soldQuantity,
          }),
        },
      };
    });

  for (const chunk of chunkRecords(records, 10)) {
    await airtableFetch(airtableConfig.productsTable, "", {
      method: "PATCH",
      body: JSON.stringify({ records: chunk }),
    });
  }
}

async function airtableFetch<T>(
  tableName: string,
  path = "",
  init?: RequestInit,
): Promise<T> {
  const url = `${AIRTABLE_API_URL}/${airtableConfig.baseId}/${encodeURIComponent(
    tableName,
  )}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${airtableConfig.apiToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Airtable request failed: ${response.status} ${message}`);
  }

  return response.json() as Promise<T>;
}

function mapAirtableProduct(record: AirtableRecord): Product {
  const fields = record.fields;
  const totalInventory = asNumber(fields["Total Inventory"]);
  const reservedQuantity = asNumber(fields["Reserved Quantity"]);
  const soldQuantity = asNumber(fields["Sold Quantity"]);
  const availableQuantity = calculateAvailableQuantity({
    totalInventory,
    reservedQuantity,
    soldQuantity,
  });
  const sku = asString(fields.SKU) || record.id;

  return {
    id: sku,
    airtableRecordId: record.id,
    sku,
    name: asString(fields.Name) || "Untitled product",
    type: asString(fields.Type) || "Other",
    description: asString(fields.Description),
    priceCents: asNumber(fields["Price Cents"]),
    imageUrl: getImageUrl(fields["Image URL"]) || getImageUrl(fields.Image),
    isActive: asBoolean(fields.Active),
    totalInventory,
    reservedQuantity,
    soldQuantity,
    availableQuantity,
  };
}

function getImageUrl(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const firstAttachment = value[0] as { url?: unknown } | undefined;

    if (typeof firstAttachment?.url === "string") {
      return firstAttachment.url;
    }
  }

  return "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80";
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
function asBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (typeof value === "string") {
    return ["true", "yes", "active", "1"].includes(value.toLowerCase());
  }

  return false;
}

function chunkRecords<T>(records: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < records.length; index += size) {
    chunks.push(records.slice(index, index + size));
  }

  return chunks;
}
