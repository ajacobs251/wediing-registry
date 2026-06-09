"use client";

import { useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/money";
import type { Product } from "@/types/store";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const isLowAvailability = product.availableQuantity <= 5;
  const isSoldOut = product.availableQuantity < 1;

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
        <p className={`availability ${isLowAvailability ? "low" : ""}`}>
          {isSoldOut
            ? "Sold out"
            : `${product.availableQuantity} available`}
        </p>
        <button
          className="button primary full"
          disabled={isSoldOut}
          onClick={() =>
            addItem({
              id: product.id,
              sku: product.sku,
              name: product.name,
              type: product.type,
              priceCents: product.priceCents,
              imageUrl: product.imageUrl,
            })
          }
        >
          {isSoldOut ? "Unavailable" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
