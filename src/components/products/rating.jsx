import { Star } from "lucide-react";

export function Rating({ value, count, size = 14 }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1 text-xs text-kiyomi-muted">
      <Star size={size} className="fill-kiyomi-gold text-kiyomi-gold" />
      <span>{value.toFixed(1)}</span>
      {count != null && <span>({count})</span>}
    </div>
  );
}
