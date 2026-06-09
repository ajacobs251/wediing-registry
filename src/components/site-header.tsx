"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export function SiteHeader() {
  const { itemCount } = useCart();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          Wedding Registry
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>
          <Link href="/cart" className="cart-link">
            Cart <span className="cart-count">{itemCount}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
