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
};

const registryNotificationRecipients = [
  "addRus32@gmail.com",
  "mmdavis441@gmail.com",
];

const registryEmailSubject = "Registry Item Received";
const customerReceiptSubject = "Wedding Registry Confirmation";
const receiptImageContentId = "wedding-home-picture";
const receiptImagePath = path.join(
  process.cwd(),
  "public",
  "images",
  "email-home-picture.png",
);

export async function sendRegistryOrderNotification({
  customerName,
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
  const text = items
    .map((item) => `${displayName} has just bought ${item.quantity} ${item.name}`)
    .join("\n");

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
  const itemMessages = items.map(
    (item) =>
      `Thank you ${displayName} so much for buying us ${item.quantity} ${item.name}! We really appreciate it and look forward to enjoying the gift you have given us!\nAmount: ${formatCurrency(item.lineTotalCents)}`,
  );
  const text = `${itemMessages.join("\n\n")}\n\nYour confirmation code is ${orderId}`;
  const htmlItemMessages = items
    .map(
      (item) => `<p>Thank you ${escapeHtml(displayName)} so much for buying us ${item.quantity} ${escapeHtml(item.name)}! We really appreciate it and look forward to enjoying the gift you have given us!</p>
<p><strong>Amount:</strong> ${formatCurrency(item.lineTotalCents)}</p>`,
    )
    .join("");

  await resend.emails.send({
    from,
    to,
    subject: customerReceiptSubject,
    text,
    html: `<div style="font-family: Georgia, serif; color: #0b1942; line-height: 1.6;">
${htmlItemMessages}
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}
