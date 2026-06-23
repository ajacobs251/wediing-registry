import Link from "next/link";

import { ProductsGrid } from "@/components/products-grid";
import { getPublicProducts } from "@/lib/airtable";

export default async function ProductsPage() {
  const products = (await getPublicProducts()).filter((product) => product.isActive);

  return (
    <div className="page-shell">
      <section className="section-heading">
        <p className="eyebrow">Registry</p>
        <h1>Browse the Registry</h1>
        <p>
          Choose wedding gifts and experiences for the happy couple. Browse by category or scroll through all items to find the perfect gift. We are so grateful for your generosity and can&apos;t wait to celebrate with you!
        </p>
        <div className="actions">
          <Link className="button secondary" href="/wedding-decorations">
            Wedding Decorations
          </Link>
        </div>
      </section>
      <ProductsGrid products={products} />
    </div>
  );
}
