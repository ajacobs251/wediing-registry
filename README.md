# Wedding Website

A Next.js storefront for curated wedding items. The app uses:

- Next.js App Router and TypeScript
- Netlify hosting
- Client-side cart storage with `localStorage`
- Airtable for products, orders, and order items
- Manual payment handoff through Venmo, Cash App, PayPal, or Mail In Check
- QR-based checkout for Venmo, Cash App, and PayPal
- Resend email notifications when registry items are purchased, including optional customer receipt emails
- Password-protected wedding RSVP access using a signed browser session

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

Required for payment links and email notifications:

- `NEXT_PUBLIC_VENMO_USERNAME`
- `NEXT_PUBLIC_CASHAPP_CASHTAG`
- `NEXT_PUBLIC_PAYPAL_ME_HANDLE`
- `RESEND_API_KEY`
- `REGISTRY_EMAIL_FROM`

Required for password-protected RSVP access:

- `RSVP_PASSWORD`
- `RSVP_SESSION_SECRET`

The Mail In Check address is intentionally kept as a code placeholder. Update it in `src/lib/payments.ts` by replacing the `CHECK_MAILING_ADDRESS` lines with the real mailing address.

`REGISTRY_EMAIL_FROM` must be a sender address verified in Resend, for example `Wedding Registry <registry@yourdomain.com>`. If `RESEND_API_KEY` or `REGISTRY_EMAIL_FROM` is missing, checkout still works but the email notification is skipped.

`RSVP_PASSWORD` is the shared password provided to invited wedding guests. `RSVP_SESSION_SECRET` signs the secure RSVP access cookie and should be a separate random value of at least 32 characters. Keep both values in local or Netlify environment variables and never commit their real values. Guests remain authorized in a browser for 30 days after entering the password.

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

## Deploying to Netlify

Connect the GitHub repository to Netlify, add the environment variables in the Netlify project configuration, and deploy. Do not use `output: "export"` because the Airtable integration and RSVP password gate need server-side route handlers.
