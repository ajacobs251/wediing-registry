import { ProductCard } from "@/components/product-card";
import type { Product } from "@/types/store";

export function ProductsGrid({ products }: { products: Product[] }) {
  const categories = Array.from(new Set(products.map((product) => product.type)));

  return (
    <div>
      {categories.map((category) => (
        <section className="product-section" id={category} key={category}>
          <h2 className="product-section-title">{category}</h2>
          <div className="product-grid">
            {products
              .filter((product) => product.type === category)
              .map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
