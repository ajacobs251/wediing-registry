export type Product = {
  id: string;
  airtableRecordId?: string;
  sku: string;
  name: string;
  type: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  isActive: boolean;
  totalInventory: number;
  reservedQuantity: number;
  soldQuantity: number;
  availableQuantity: number;
};

export type CartProductSnapshot = Pick<
  Product,
  "id" | "sku" | "name" | "type" | "priceCents" | "imageUrl"
>;

export type CartItem = {
  product: CartProductSnapshot;
  quantity: number;
};
export type PaymentMethod = "venmo" | "cashapp" | "paypal" | "mail-in-check";

export type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
  paymentMethod: PaymentMethod;
  registryUserName: string;
  notes: string;
};

export type CheckoutRequest = {
  customer: CustomerInfo;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

export type OrderSummaryItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type OrderSummary = {
  orderId: string;
  items: OrderSummaryItem[];
  subtotalCents: number;
  feesCents: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  paymentMethodLabel: string;
  paymentRecipient: string;
  paymentUrl?: string;
  paymentQrImageUrl?: string;
  paymentNote: string;
  checkMailingAddress?: string;
  paymentStatus: "Pending Payment";
  demoMode: boolean;
};
