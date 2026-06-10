"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/money";
import { getPaymentOption, paymentMethodLabels } from "@/lib/payments";
import type { CustomerInfo, OrderSummary } from "@/types/store";

const initialCustomer: CustomerInfo = {
  name: "",
  email: "",
  phone: "",
  paymentMethod: "venmo",
  registryUserName: "",
  notes: "",
};

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotalCents, clearCart } = useCart();
  const [customer, setCustomer] = useState<CustomerInfo>(initialCustomer);
  const [error, setError] = useState("");
  const [hasConfirmedPayment, setHasConfirmedPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const paymentOption = getPaymentOption(
    customer.paymentMethod,
    customer.registryUserName,
  );

  const checkoutItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    [items],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!hasConfirmedPayment) {
      setError("Please review the payment instructions and confirm before completing checkout.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer,
          items: checkoutItems,
        }),
      });
      const data = (await response.json()) as {
        order?: OrderSummary;
        error?: string;
      };

      if (!response.ok || !data.order) {
        throw new Error(data.error ?? "Unable to create order.");
      }

      window.sessionStorage.setItem("lastOrder", JSON.stringify(data.order));
      clearCart();
      router.push("/confirmation");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create order.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="notice">
        <h2>Your cart is empty.</h2>
        <p className="muted">Add products before checkout.</p>
        <Link className="button primary" href="/products">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-layout">
      <form className="checkout-card form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            required
            value={customer.name}
            onChange={(event) =>
              setCustomer((current) => ({ ...current, name: event.target.value }))
            }
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email for receipt (optional)</label>
          <input
            id="email"
            type="email"
            value={customer.email}
            onChange={(event) =>
              setCustomer((current) => ({ ...current, email: event.target.value }))
            }
          />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            value={customer.phone}
            onChange={(event) =>
              setCustomer((current) => ({ ...current, phone: event.target.value }))
            }
          />
        </div>
        <div className="field">
          <label htmlFor="paymentMethod">Payment method</label>
          <select
            id="paymentMethod"
            value={customer.paymentMethod}
            onChange={(event) => {
              setHasConfirmedPayment(false);
              setCustomer((current) => ({
                ...current,
                paymentMethod: event.target.value as CustomerInfo["paymentMethod"],
              }));
            }}
          >
            {Object.entries(paymentMethodLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={customer.notes}
            onChange={(event) =>
              setCustomer((current) => ({ ...current, notes: event.target.value }))
            }
          />
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <button
          className="button primary full"
          disabled={isSubmitting || !hasConfirmedPayment}
          type="submit"
        >
          {isSubmitting ? "Completing checkout..." : "Complete checkout"}
        </button>
      </form>
      <aside className="checkout-card">
        <h2>Review order</h2>
        {items.map((item) => (
          <div className="summary-row" key={item.product.id}>
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <strong>
              {formatCurrency(item.product.priceCents * item.quantity)}
            </strong>
          </div>
        ))}
        <div className="summary-row total">
          <span>Total</span>
          <strong>{formatCurrency(subtotalCents)}</strong>
        </div>
        <p className="muted">
          Follow the payment instructions for your selected method, then press
          Complete checkout. Inventory and final total are checked again before
          your order is saved.
        </p>
        <div className="payment-box checkout-payment">
          <p className="eyebrow">{paymentOption.label}</p>
          {paymentOption.qrImageUrl ? (
            <div className="qr-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={paymentOption.qrImageUrl}
                alt={`${paymentOption.label} QR code for ${paymentOption.recipient}`}
              />
            </div>
          ) : null}
          <div className="payment-detail">
            <span>Amount</span>
            <strong>{formatCurrency(subtotalCents)}</strong>
          </div>
          <div className="payment-detail">
            <span>{paymentOption.checkMailingAddress ? "Mail to" : "Send to"}</span>
            <strong>{paymentOption.recipient}</strong>
          </div>
          {paymentOption.checkMailingAddress ? (
            <pre className="payment-address">{paymentOption.checkMailingAddress}</pre>
          ) : null}
          <div className="payment-detail">
            <span>Required note</span>
            <div className="payment-note-builder">
              <strong>Registry User -</strong>
              <input
                id="registryUserName"
                placeholder="Customer"
                aria-label="Registry user name for payment note"
                value={customer.registryUserName}
                onChange={(event) => {
                  setHasConfirmedPayment(false);
                  setCustomer((current) => ({
                    ...current,
                    registryUserName: event.target.value,
                  }));
                }}
              />
            </div>
            <strong className="payment-note-preview">{paymentOption.note}</strong>
          </div>
          {paymentOption.url ? (
            <a
              className="button secondary full"
              href={paymentOption.url}
              rel="noreferrer"
              target="_blank"
            >
              Open {paymentOption.label}
            </a>
          ) : null}
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={hasConfirmedPayment}
              onChange={(event) => setHasConfirmedPayment(event.target.checked)}
            />
            <span>
              {paymentOption.checkMailingAddress
                ? "I understand I need to mail the check."
                : `I have sent the ${paymentOption.label} payment.`}
            </span>
          </label>
        </div>
      </aside>
    </div>
  );
}
