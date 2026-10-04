"use client";

import { useState } from "react";
import { useSearch } from "@/hooks/use-products";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductGridSkeleton } from "@/components/ui/loading-skeleton";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useSearch(q);

  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <div className="relative mx-auto max-w-md">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kiyomi-muted" />
        <Input
          placeholder="Search products, SKU, category..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
          aria-label="Search"
        />
      </div>

      <div className="mt-10">
        {q.trim() === "" && <p className="text-center text-sm text-kiyomi-muted">Start typing to search Kiyomi's catalog.</p>}
        {isLoading && <ProductGridSkeleton />}
        {data && <ProductGrid products={data.products} />}
      </div>
    </div>
  );
}