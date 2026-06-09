# Wedding Website

A Next.js storefront for curated wedding items. The app uses:

- Next.js App Router and TypeScript
- Vercel hosting
- Client-side cart storage with `localStorage`
- Airtable for products, inventory, orders, and order items
- Manual payment handoff through Venmo, Cash App, PayPal, or Mail In Check
- QR-based checkout for Venmo, Cash App, and PayPal

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

The Mail In Check address is intentionally kept as a code placeholder. Update it in `src/lib/payments.ts` by replacing the `CHECK_MAILING_ADDRESS` lines with the real mailing address.

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
- `Total Inventory`
- `Reserved Quantity`
- `Sold Quantity`
- `Available Quantity` optional

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
4. The server validates inventory against Airtable.
5. The server creates Airtable order and order item records.
6. Customer follows the selected payment instructions and confirms before checkout.
7. The confirmation page shows the saved order and selected payment details.
8. You manually match the payment to the Airtable order and update the order status.

## Deploying to Vercel

Connect the GitHub repository to Vercel, add the environment variables in Vercel project settings, and deploy. Do not use `output: "export"` because the Airtable integration needs server-side route handlers.
