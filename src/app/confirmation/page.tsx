import { ConfirmationDetails } from "@/components/confirmation-details";

export default function ConfirmationPage() {
  return (
    <div className="page-shell">
      <section className="section-heading">
        <p className="eyebrow">Confirmation</p>
        <h1>Finish your payment</h1>
        <p>
          Use the required payment note below so your payment can be matched to
          your order.
        </p>
      </section>
      <ConfirmationDetails />
    </div>
  );
}
