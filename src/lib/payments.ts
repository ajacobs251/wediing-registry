import type { PaymentMethod } from "@/types/store";

type PaymentOption = {
  method: PaymentMethod;
  label: string;
  recipient: string;
  url?: string;
  qrImageUrl?: string;
  note: string;
  checkMailingAddress?: string;
};

const qrCodeUrl = (url: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(url)}`;

const cleanVenmoUsername = (process.env.NEXT_PUBLIC_VENMO_USERNAME ?? "ajacobs52").replace(
  /^@/,
  "",
);
const cleanCashAppCashtag = (
  process.env.NEXT_PUBLIC_CASHAPP_CASHTAG ?? "AlexJacobs51"
).replace(/^\$/, "");
const cleanPaypalMeHandle = (
  process.env.NEXT_PUBLIC_PAYPAL_ME_HANDLE ?? "AlexanderJacobs558"
).replace(/^@/, "");

export const CHECK_MAILING_ADDRESS = [
  "Kenzie and Alex's Apartment",
  "2889 Sollie Rd",
  "Apt 1514",
  "Mobile, Al 36695",
].join("\n");

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  venmo: "Venmo",
  cashapp: "Cash App",
  paypal: "PayPal",
  "mail-in-check": "Mail In Check",
};

export function getPaymentOption(method: PaymentMethod, registryUserName = "Customer"): PaymentOption {
  const note = `Registry User - ${registryUserName.trim() || "Customer"}`;

  if (method === "cashapp") {
    const url = `https://cash.app/$${cleanCashAppCashtag}`;

    return {
      method,
      label: paymentMethodLabels[method],
      recipient: `$${cleanCashAppCashtag}`,
      url,
      qrImageUrl: qrCodeUrl(url),
      note,
    };
  }

  if (method === "paypal") {
    const url = `https://paypal.me/${cleanPaypalMeHandle}`;

    return {
      method,
      label: paymentMethodLabels[method],
      recipient: cleanPaypalMeHandle,
      url,
      qrImageUrl: qrCodeUrl(url),
      note,
    };
  }

  if (method === "mail-in-check") {
    return {
      method,
      label: paymentMethodLabels[method],
      recipient: "Mail In Check",
      note,
      checkMailingAddress: CHECK_MAILING_ADDRESS,
    };
  }

  const url = `https://account.venmo.com/u/${cleanVenmoUsername}`;

  return {
    method,
    label: paymentMethodLabels[method],
    recipient: `@${cleanVenmoUsername}`,
    url,
    qrImageUrl: qrCodeUrl(url),
    note,
  };
}
