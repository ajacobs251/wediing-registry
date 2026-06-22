import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { Resend } from "resend";
import { formatCurrency } from "@/lib/money";

type RegistryNotificationItem = {
  name: string;
  quantity: number;
};

type RegistryNotificationInput = {
  customerName: string;
  orderId: string;
  items: RegistryNotificationItem[];
};
type CustomerReceiptItem = {
  name: string;
  quantity: number;
  lineTotalCents: number;
};

type CustomerReceiptInput = {
  customerEmail: string;
  customerName: string;
  orderId: string;
  items: CustomerReceiptItem[];
  totalCents: number;
};
type RsvpNotificationInput = {
  name: string;
  email: string;
  foodAllergies: string;
};

const registryNotificationRecipients = [
  "addRus32@gmail.com",
  "mmdavis441@gmail.com",
];

const registryEmailSubject = "Registry Item Received";
const customerReceiptSubject = "Wedding Registry Confirmation";
const rsvpNotificationSubject = "Wedding RSVP Received";
const receiptImageContentId = "wedding-home-picture";
const receiptImagePath = path.join(
  process.cwd(),
  "public",
  "images",
  "email-home-picture.png",
);

export async function sendRegistryOrderNotification({
  customerName,
  orderId,
  items,
}: RegistryNotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REGISTRY_EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(
      "Skipping registry email notification because RESEND_API_KEY or REGISTRY_EMAIL_FROM is not configured.",
    );
    return;
  }

  const resend = new Resend(apiKey);
  const displayName = customerName.trim() || "Customer";
  const itemList = formatItemList(items);
  const text = `${displayName} has just bought ${itemList}\nConfirmation code: ${orderId}`;

  await resend.emails.send({
    from,
    to: registryNotificationRecipients,
    subject: registryEmailSubject,
    text,
  });
}

export async function sendCustomerOrderReceipt({
  customerEmail,
  customerName,
  orderId,
  items,
  totalCents,
}: CustomerReceiptInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REGISTRY_EMAIL_FROM;
  const to = customerEmail.trim();

  if (!to) {
    return;
  }

  if (!apiKey || !from) {
    console.warn(
      "Skipping customer receipt email because RESEND_API_KEY or REGISTRY_EMAIL_FROM is not configured.",
    );
    return;
  }

  const resend = new Resend(apiKey);
  const displayName = customerName.trim() || "Customer";
  const itemList = formatItemList(items);
  const thankYouMessage = `Thank you ${displayName} so much for buying us ${itemList}! We really appreciate it and look forward to enjoying the gift you have given us!`;
  const text = `${thankYouMessage}\n\nAmount: ${formatCurrency(totalCents)}\n\nYour confirmation code is ${orderId}`;

  await resend.emails.send({
    from,
    to,
    subject: customerReceiptSubject,
    text,
    html: `<div style="font-family: Georgia, serif; color: #0b1942; line-height: 1.6;">
<p>${escapeHtml(thankYouMessage)}</p>
<p><strong>Amount:</strong> ${formatCurrency(totalCents)}</p>
<p><strong>Your confirmation code is ${escapeHtml(orderId)}</strong></p>
<img src="cid:${receiptImageContentId}" alt="Kenzie and Alex" style="display: block; width: 100%; max-width: 560px; height: auto; margin-top: 24px; border-radius: 16px;" />
</div>`,
    attachments: [
      {
        content: await readFile(receiptImagePath),
        filename: "home-picture.png",
        contentType: "image/png",
        contentId: receiptImageContentId,
      },
    ],
  });
}

export async function sendRsvpNotification({
  name,
  email,
  foodAllergies,
}: RsvpNotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REGISTRY_EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(
      "Skipping RSVP email notification because RESEND_API_KEY or REGISTRY_EMAIL_FROM is not configured.",
    );
    return;
  }

  const resend = new Resend(apiKey);
  const displayName = name.trim() || "Guest";
  const displayEmail = email.trim() || "no email provided";
  const displayFoodAllergies = foodAllergies.trim() || "no";
  const text = `${displayName} at ${displayEmail} has RSVP'd to the wedding. They have listed ${displayFoodAllergies} food allergies.`;

  await resend.emails.send({
    from,
    to: registryNotificationRecipients,
    subject: rsvpNotificationSubject,
    text,
  });
}
function formatItemList(items: Array<{ name: string; quantity: number }>) {
  const itemLabels = items.map((item) => `${item.quantity} ${item.name}`);

  if (itemLabels.length <= 1) {
    return itemLabels[0] ?? "gift";
  }

  if (itemLabels.length === 2) {
    return `${itemLabels[0]} and ${itemLabels[1]}`;
  }

  return `${itemLabels.slice(0, -1).join(", ")}, and ${itemLabels[itemLabels.length - 1]}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}
