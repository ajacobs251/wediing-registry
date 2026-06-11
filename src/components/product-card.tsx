"use client";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/money";
import type { Product } from "@/types/store";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [isChoosingQuantity, setIsChoosingQuantity] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const maxSelectableQuantity = 99;

  useEffect(() => {
    if (!showAddedMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowAddedMessage(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [showAddedMessage]);

  function changeSelectedQuantity(nextQuantity: number) {
    setSelectedQuantity(Math.max(1, Math.min(nextQuantity, maxSelectableQuantity)));
  }

  function handleAddToCart() {
    setSelectedQuantity(1);
    setShowAddedMessage(false);
    setIsChoosingQuantity(true);
  }

  function handleConfirmQuantity() {
    addItem(
      {
        id: product.id,
        sku: product.sku,
        name: product.name,
        type: product.type,
        priceCents: product.priceCents,
        imageUrl: product.imageUrl,
      },
      selectedQuantity,
    );
    setIsChoosingQuantity(false);
    setSelectedQuantity(1);
    setShowAddedMessage(true);
  }

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl} alt="" className="product-image" />
      </div>
      <div className="product-card-body">
        <p className="product-type">{product.type}</p>
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <p className="product-price">{formatCurrency(product.priceCents)}</p>
        {isChoosingQuantity ? (
          <div className="add-to-cart-picker" aria-label="Choose quantity">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => changeSelectedQuantity(selectedQuantity - 1)}
              disabled={selectedQuantity <= 1}
            >
              -
            </button>
            <strong>{selectedQuantity}</strong>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => changeSelectedQuantity(selectedQuantity + 1)}
              disabled={selectedQuantity >= maxSelectableQuantity}
            >
              +
            </button>
            <button
              className="confirm-add-button"
              type="button"
              aria-label="Add selected quantity to cart"
              onClick={handleConfirmQuantity}
            >
              ✓
            </button>
          </div>
        ) : (
          <button className="button primary full" onClick={handleAddToCart}>
            Add to cart
          </button>
        )}
        {showAddedMessage ? (
          <p className="added-to-cart-message" role="status">
            Added to cart
          </p>
        ) : null}
      </div>
    </article>
  );
}
