import { formatCurrency } from "@/lib/money";

export function PaymentInstructions({
  totalCents,
  paymentMethodLabel,
  paymentRecipient,
  paymentUrl,
  paymentQrImageUrl,
  paymentNote,
  checkMailingAddress,
}: {
  totalCents: number;
  paymentMethodLabel: string;
  paymentRecipient: string;
  paymentUrl?: string;
  paymentQrImageUrl?: string;
  paymentNote: string;
  checkMailingAddress?: string;
}) {
  return (
    <div className="payment-box">
      <p className="eyebrow">{paymentMethodLabel} payment</p>
      {paymentQrImageUrl ? (
        <div className="qr-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={paymentQrImageUrl}
            alt={`${paymentMethodLabel} QR code for ${paymentRecipient}`}
          />
        </div>
      ) : null}
      {checkMailingAddress ? (
        <pre className="payment-address">{checkMailingAddress}</pre>
      ) : null}
      {paymentUrl ? (
        <a className="button secondary full" href={paymentUrl} rel="noreferrer" target="_blank">
          Open {paymentMethodLabel}
        </a>
      ) : null}
      <div className="payment-detail">
        <span>Amount</span>
        <strong>{formatCurrency(totalCents)}</strong>
      </div>
      <div className="payment-detail">
        <span>{checkMailingAddress ? "Mail to" : "Send to"}</span>
        <strong>{paymentRecipient}</strong>
      </div>
      <div className="payment-detail">
        <span>Required note</span>
        <strong>{paymentNote}</strong>
      </div>
      <p className="muted">
        {checkMailingAddress
          ? "Mail the check for the exact amount to the address above. Your order remains pending until the check is manually confirmed."
          : "Scan the QR code, send the exact amount, and include the note above. Your order remains pending until the payment is manually confirmed."}
      </p>
    </div>
  );
}
