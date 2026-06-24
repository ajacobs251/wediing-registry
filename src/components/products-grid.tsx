import { ProductCard } from "@/components/product-card";
import type { Product } from "@/types/store";

export function ProductsGrid({ products }: { products: Product[] }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
}
