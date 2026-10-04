import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-kiyomi-muted">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-kiyomi-ink">{item.label}</Link>
          ) : (
            <span aria-current="page" className="text-kiyomi-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
