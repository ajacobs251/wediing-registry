import Link from "next/link";

import { ProductsGrid } from "@/components/products-grid";
import { getPublicProducts } from "@/lib/airtable";

export default async function ProductsPage() {
  const products = (await getPublicProducts()).filter((product) => product.isActive);

  return (
    <div className="page-shell">
      <section className="section-heading">
        <h1>Registry</h1>
        <p>Click here for the Amazon Registry.</p>
        <div className="actions">
          <Link className="button secondary" href="/wedding-decorations">
            Amazon Registry
          </Link>
        </div>
      </section>
      <ProductsGrid products={products} />
    </div>
  );
}
