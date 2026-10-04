"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/brand";
import { Plus } from "lucide-react";

export default function AdminCouponsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-coupons", search, status, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/coupons?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Coupons</h1>
        <Link
          href="/admin/coupons/new"
          className="flex items-center gap-2 bg-kiyomi-ink px-4 py-2 text-sm text-white"
        >
          <Plus className="h-4 w-4" /> New coupon
        </Link>
      </div>

      <div className="mt-6 flex gap-3">
        <input
          placeholder="Search by code"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-md border px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="mt-6 border border-kiyomi-sandDark bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-kiyomi-sandDark text-left text-xs uppercase tracking-wide text-kiyomi-muted">
              <th className="p-3">Code</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Usage</th>
              <th className="p-3">Expires</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-6 text-center text-kiyomi-muted">Loading...</td></tr>
            ) : data?.coupons.length ? (
              data.coupons.map((c) => {
                const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                return (
                  <tr key={c.id} className="border-b border-kiyomi-sandDark last:border-0">
                    <td className="p-3">
                      <Link href={`/admin/coupons/${c.id}`} className="underline">{c.code}</Link>
                    </td>
                    <td className="p-3">
                      {c.type === "PERCENTAGE" ? `${c.percentage}%` : formatPrice(c.fixedAmountCents)}
                    </td>
                    <td className="p-3">
                      {c.timesUsed}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                    </td>
                    <td className="p-3">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-3">
                      {!c.isActive ? (
                        <span className="rounded bg-kiyomi-sand px-2 py-1 text-xs">Inactive</span>
                      ) : expired ? (
                        <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">Expired</span>
                      ) : (
                        <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">Active</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={5} className="p-6 text-center text-kiyomi-muted">No coupons found.</td></tr>
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