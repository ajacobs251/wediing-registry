import { ProductsGrid } from "@/components/products-grid";
import { getPublicProducts } from "@/lib/airtable";

export default async function ProductsPage() {
  const products = (await getPublicProducts()).filter((product) => product.isActive);

  return (
    <div className="page-shell">
      <section className="section-heading">
        <p className="eyebrow">Products</p>
        <h1>Shop by type</h1>
        <p>
          Choose wedding details for the celebration. Your cart is saved in this
          browser, and inventory is checked again during checkout.
        </p>
      </section>
      <ProductsGrid products={products} />
    </div>
  );
}
