# Wedding Website

A Next.js storefront for curated wedding items. The app uses:

- Next.js App Router and TypeScript
- Vercel hosting
- Client-side cart storage with `localStorage`
- Airtable for products, orders, and order items
- Manual payment handoff through Venmo, Cash App, PayPal, or Mail In Check
- QR-based checkout for Venmo, Cash App, and PayPal
- Resend email notifications when registry items are purchased, including optional customer receipt emails

## Local development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Without Airtable environment variables, the app runs in demo mode with sample products and demo order creation.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
copy .env.example .env.local
```

Required for real Airtable-backed orders:

- `AIRTABLE_API_TOKEN`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_PRODUCTS_TABLE`
- `AIRTABLE_ORDERS_TABLE`
- `AIRTABLE_ORDER_ITEMS_TABLE`
- `NEXT_PUBLIC_VENMO_USERNAME`
- `NEXT_PUBLIC_CASHAPP_CASHTAG`
- `NEXT_PUBLIC_PAYPAL_ME_HANDLE`
- `RESEND_API_KEY`
- `REGISTRY_EMAIL_FROM`

The Mail In Check address is intentionally kept as a code placeholder. Update it in `src/lib/payments.ts` by replacing the `CHECK_MAILING_ADDRESS` lines with the real mailing address.

`REGISTRY_EMAIL_FROM` must be a sender address verified in Resend, for example `Wedding Registry <registry@yourdomain.com>`. If `RESEND_API_KEY` or `REGISTRY_EMAIL_FROM` is missing, checkout still works but the email notification is skipped.

## Airtable schema

Create these tables:

### Products

Expected fields:

- `SKU`
- `Name`
- `Type`
- `Description`
- `Price Cents`
- `Image URL` or `Image`
- `Active`

### Orders

Expected fields:

- `Order ID`
- `Customer Name`
- `Email`
- `Phone`
- `Notes`
- `Subtotal Cents`
- `Fees Cents`
- `Total Cents`
- `Payment Method`
- `Payment Status`
- `Fulfillment Status`
- `Payment Note`

### Order Items

Expected fields:

- `Order`
- `Product`
- `Product ID`
- `Product Name`
- `Quantity`
- `Unit Price Cents`
- `Line Total Cents`

## Workflow

1. Customer browses products by type.
2. Customer adds items to the browser-stored cart.
3. Customer selects Venmo, Cash App, PayPal, or Mail In Check.
4. The server validates the selected products against Airtable.
5. The server creates Airtable order and order item records.
6. Customer follows the selected payment instructions and confirms before checkout.
7. The confirmation page shows the saved order and selected payment details.
8. The app sends a `Registry Item Received` email to the configured registry notification recipients.
9. If the customer entered an email address, the app sends them a receipt with their purchased items, amounts, confirmation code, and the home picture.
10. You manually match the payment to the Airtable order and update the order status.

## Deploying to Vercel

Connect the GitHub repository to Vercel, add the environment variables in Vercel project settings, and deploy. Do not use `output: "export"` because the Airtable integration needs server-side route handlers.
