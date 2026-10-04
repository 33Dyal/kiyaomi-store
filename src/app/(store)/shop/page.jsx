"use client";

import { useState } from "react";
import { useProducts, useCategories } from "@/hooks/use-products";
import { ProductGrid } from "@/components/products/product-grid";

export default function ShopPage() {
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProducts({ category, sort, page });
  const { data: categoriesData } = useCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl">Shop</h1>

        <div className="flex gap-3">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="border px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categoriesData?.categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.productCount})
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="bestselling">Bestselling</option>
            <option value="featured">Featured</option>
          </select>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse bg-kiyomi-sandDark" />
          ))}
        </div>
      ) : (
        <ProductGrid products={data.products} />
      )}
    </div>
  );
}