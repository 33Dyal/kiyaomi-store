import { formatPrice } from "@/lib/utils/formatPrice";
import { cn } from "@/lib/utils/cn";

/**
 * Displays a product price, showing a strikethrough original price and an
 * accent sale price when `salePriceMinor` is present and lower than
 * `priceMinor`. Prices are always passed as integer minor units (cents).
 */
export default function PriceDisplay({ priceMinor, salePriceMinor, size = "md", className }) {
  const onSale = typeof salePriceMinor === "number" && salePriceMinor < priceMinor;
  const sizeClass = size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-base";

  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={cn(sizeClass, onSale ? "text-accent font-medium" : "text-ink")}>
        {formatPrice(onSale ? salePriceMinor : priceMinor)}
      </span>
      {onSale && (
        <span className="text-stone line-through text-sm">{formatPrice(priceMinor)}</span>
      )}
    </span>
  );
}
