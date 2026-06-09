import { CartView } from "@/components/cart-view";

export default function CartPage() {
  return (
    <div className="page-shell">
      <section className="section-heading">
        <p className="eyebrow">Cart</p>
        <h1>Review your order</h1>
        <p>
          Adjust quantities before checkout. Final availability is confirmed when
          the order is created.
        </p>
      </section>
      <CartView />
    </div>
  );
}
