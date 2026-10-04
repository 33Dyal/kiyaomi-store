"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/brand";
import { Plus } from "lucide-react";

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const s = searchParams.get("search");
    if (s) setSearch(s);
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Products</h1>
        <Link href="/admin/products/new" className="flex items-center gap-2 bg-kiyomi-ink px-4 py-2 text-sm text-white">
          <Plus className="h-4 w-4" /> New product
        </Link>
      </div>

      <input
        placeholder="Search by name, SKU, or slug"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="mt-6 w-full max-w-md border px-3 py-2 text-sm"
      />

      <div className="mt-6 border border-kiyomi-sandDark bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-kiyomi-sandDark text-left text-xs uppercase tracking-wide text-kiyomi-muted">
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Published</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-6 text-center text-kiyomi-muted">Loading...</td></tr>
            ) : data?.products.length ? (
              data.products.map((p) => (
                <tr key={p.id} className="border-b border-kiyomi-sandDark last:border-0">
                  <td className="p-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-10 w-10 object-cover" />
                      ) : (
                        <div className="h-10 w-10 bg-kiyomi-sandDark" />
                      )}
                      <span className="underline">{p.name}</span>
                    </Link>
                    <div className="pl-13 text-xs text-kiyomi-muted">{p.sku}</div>
                  </td>
                  <td className="p-3">{p.categoryName}</td>
                  <td className="p-3">
                    {formatPrice(p.salePriceCents ?? p.priceCents)}
                    {p.salePriceCents && <span className="ml-2 text-xs text-kiyomi-muted line-through">{formatPrice(p.priceCents)}</span>}
                  </td>
                  <td className="p-3">
                    <span className={p.totalStock <= 5 ? "text-kiyomi-terracotta" : ""}>{p.totalStock}</span>
                  </td>
                  <td className="p-3">
                    {p.isPublished ? (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">Published</span>
                    ) : (
                      <span className="rounded bg-kiyomi-sand px-2 py-1 text-xs">Draft</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="p-6 text-center text-kiyomi-muted">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="border px-3 py-1 text-sm disabled:opacity-40">Previous</button>
          <span className="px-2 py-1 text-sm">Page {data.pagination.page} of {data.pagination.totalPages}</span>
          <button disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="border px-3 py-1 text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}