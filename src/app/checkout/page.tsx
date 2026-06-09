import { CheckoutForm } from "@/components/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="page-shell">
      <section className="section-heading">
        <p className="eyebrow">Checkout</p>
        <h1>Create your order</h1>
        <p>
          Submit your contact details first. After the order is saved, you will
          receive Venmo instructions with the exact amount and required note.
        </p>
      </section>
      <CheckoutForm />
    </div>
  );
}
