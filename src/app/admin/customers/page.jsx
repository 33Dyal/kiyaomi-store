"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/brand";

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl">Customers</h1>

      <input
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="mt-6 w-full max-w-md border px-3 py-2 text-sm"
      />

      <div className="mt-6 border border-kiyomi-sandDark bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-kiyomi-sandDark text-left text-xs uppercase tracking-wide text-kiyomi-muted">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Total spent</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-6 text-center text-kiyomi-muted">Loading...</td></tr>
            ) : data?.customers.length ? (
              data.customers.map((c) => (
                <tr key={c.id} className="border-b border-kiyomi-sandDark last:border-0">
                  <td className="p-3">
                    <Link href={`/admin/customers/${c.id}`} className="underline">{c.name}</Link>
                  </td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">
                    <span className="rounded bg-kiyomi-sand px-2 py-1 text-xs">{c.role}</span>
                  </td>
                  <td className="p-3">{c.orderCount}</td>
                  <td className="p-3">{formatPrice(c.totalSpentCents)}</td>
                  <td className="p-3">
                    {c.isActive ? (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">Active</span>
                    ) : (
                      <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">Deactivated</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="p-6 text-center text-kiyomi-muted">No customers found.</td></tr>
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