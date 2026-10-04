import { ProductCard } from "./product-card";
import { EmptyState } from "@/components/ui/empty-state";

export function ProductGrid({ products }) {
  if (!products.length) {
    return <EmptyState title="No products found" description="Try adjusting your filters or search." />;
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
