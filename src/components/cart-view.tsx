"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/money";

export function CartView() {
  const { items, subtotalCents, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="notice">
        <h2>Your cart is empty.</h2>
        <p className="muted">
          Add a few wedding items before starting checkout.
        </p>
        <div className="actions">
          <Link className="button primary" href="/products">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <section className="cart-panel">
        <div className="cart-items">
          {items.map((item) => (
            <article className="cart-item" key={item.product.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.product.imageUrl}
                alt=""
                className="cart-item-image"
              />
              <div>
                <p className="product-type">{item.product.type}</p>
                <h3>{item.product.name}</h3>
                <p className="muted">
                  {formatCurrency(item.product.priceCents)} each
                </p>
                <div className="quantity-control" aria-label="Quantity controls">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <strong>{item.quantity}</strong>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <strong className="cart-item-price">
                {formatCurrency(item.product.priceCents * item.quantity)}
              </strong>
            </article>
          ))}
        </div>
      </section>
      <aside className="cart-panel">
        <h2>Order summary</h2>
        <div className="summary-row">
          <span>Subtotal</span>
          <strong>{formatCurrency(subtotalCents)}</strong>
        </div>
        <div className="summary-row">
          <span>Fees</span>
          <strong>{formatCurrency(0)}</strong>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <strong>{formatCurrency(subtotalCents)}</strong>
        </div>
        <div className="actions">
          <Link className="button primary full" href="/checkout">
            Continue to checkout
          </Link>
          <button className="button secondary full" type="button" onClick={clearCart}>
            Clear cart
          </button>
        </div>
      </aside>
    </div>
  );
}
