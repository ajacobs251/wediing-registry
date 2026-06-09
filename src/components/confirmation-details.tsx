"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PaymentInstructions } from "@/components/payment-instructions";
import { formatCurrency } from "@/lib/money";
import type { OrderSummary } from "@/types/store";

export function ConfirmationDetails() {
  const [order, setOrder] = useState<OrderSummary | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedOrder = window.sessionStorage.getItem("lastOrder");

      if (storedOrder) {
        setOrder(JSON.parse(storedOrder) as OrderSummary);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (!order) {
    return (
      <div className="notice">
        <h2>No recent order found.</h2>
        <p className="muted">
          If you refreshed this page, your order may still have been submitted.
          Check your email or contact the store owner if you need help.
        </p>
        <Link className="button primary" href="/products">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-layout">
      <section className="checkout-card">
        <p className="eyebrow">Order created</p>
        <h2>{order.orderId}</h2>
        <p className="success-text">
          Your order has been created. Finish payment using the instructions.
        </p>
        {order.items.map((item) => (
          <div className="summary-row" key={item.productId}>
            <span>
              {item.name} × {item.quantity}
            </span>
            <strong>{formatCurrency(item.lineTotalCents)}</strong>
          </div>
        ))}
        <div className="summary-row total">
          <span>Total</span>
          <strong>{formatCurrency(order.totalCents)}</strong>
        </div>
      </section>
      <PaymentInstructions
        totalCents={order.totalCents}
        paymentMethodLabel={order.paymentMethodLabel}
        paymentRecipient={order.paymentRecipient}
        paymentUrl={order.paymentUrl}
        paymentQrImageUrl={order.paymentQrImageUrl}
        paymentNote={order.paymentNote}
        checkMailingAddress={order.checkMailingAddress}
      />
    </div>
  );
}
