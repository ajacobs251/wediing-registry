import Link from "next/link";
import { getPublicProducts } from "@/lib/airtable";
import { formatCurrency } from "@/lib/money";

export default async function Home() {
  const products = await getPublicProducts();
  const activeProducts = products.filter((product) => product.isActive);
  const categories = Array.from(new Set(activeProducts.map((product) => product.type)));
  const featuredProducts = activeProducts.slice(0, 3);
  return (
    <div className="page-shell">
      <section className="hero">
        <p className="eyebrow">Wedding Registry for Kenzie and Alex</p>
        <h1>Wedding in Blue:</h1>
        <h1>A Symphony of Love</h1>
        <p className="hero-copy">
          Browse curated wedding items, add favorites to your cart, submit an
          order, and complete payment through Venmo using your order note.
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="/products">
            Browse products
          </Link>
          <Link className="button secondary" href="/cart">
            View cart
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Categories</p>
          <h2>Shop by type</h2>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link className="category-card" href={`/products#${category}`} key={category}>
              <span>{category}</span>
              <small>
                {
                  activeProducts.filter((product) => product.type === category)
                    .length
                }{" "}
                items
              </small>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Featured</p>
          <h2>Ready for the celebration</h2>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <article className="product-card compact" key={product.id}>
              <div className="product-image-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.imageUrl} alt="" className="product-image" />
              </div>
              <div className="product-card-body">
                <p className="product-type">{product.type}</p>
                <h3>{product.name}</h3>
                <p className="product-price">{formatCurrency(product.priceCents)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
