import { formatKes } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

export function PriceDisplay({ priceCents, salePriceCents, className }) {
  const onSale = salePriceCents != null && salePriceCents < priceCents;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("text-sm", onSale && "text-kiyomi-terracotta")}>
        {formatKes(onSale ? salePriceCents : priceCents)}
      </span>
      {onSale && (
        <span className="text-xs text-kiyomi-muted line-through">{formatKes(priceCents)}</span>
      )}
    </div>
  );
}