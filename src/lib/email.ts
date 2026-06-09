import "server-only";

import { Resend } from "resend";

type RegistryNotificationItem = {
  name: string;
  quantity: number;
};

type RegistryNotificationInput = {
  customerName: string;
  items: RegistryNotificationItem[];
};

const registryNotificationRecipients = [
  "addRus32@gmail.com",
  "mmdavis441@gmail.com",
];

const registryEmailSubject = "Registry Item Received";

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
