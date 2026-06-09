import type { Product } from "@/types/store";

type InventoryCounts = Pick<
  Product,
  "totalInventory" | "reservedQuantity" | "soldQuantity"
>;

export function calculateAvailableQuantity({
  totalInventory,
  reservedQuantity,
  soldQuantity,
}: InventoryCounts) {
  return Math.max(totalInventory - reservedQuantity - soldQuantity, 0);
}

export function withCalculatedAvailableQuantity<T extends InventoryCounts>(
  product: T,
): T & { availableQuantity: number } {
  return {
    ...product,
    availableQuantity: calculateAvailableQuantity(product),
  };
}
