import { ConfirmationDetails } from "@/components/confirmation-details";

export default function ConfirmationPage() {
  return (
    <div className="page-shell">
      <section className="section-heading">
        <p className="eyebrow">Confirmation</p>
        <h1>Finish payment with Venmo</h1>
        <p>
          Use the order ID in your Venmo note so the payment can be matched to
          your order.
        </p>
      </section>
      <ConfirmationDetails />
    </div>
  );
}
