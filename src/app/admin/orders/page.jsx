"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/brand";

const STATUS_OPTIONS = ["", "PENDING", "CONFIRMED", "PROCESSING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED"];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", status, q, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (status) params.set("status", status);
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl">Orders</h1>

      <div className="mt-6 flex gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border px-3 py-2 text-sm">
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s ? s.replace(/_/g, " ") : "All statuses"}</option>
          ))}
        </select>
        <input
          placeholder="Search order # or email"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          className="flex-1 border px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-6 border border-kiyomi-sandDark bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-kiyomi-sandDark text-left text-xs uppercase tracking-wide text-kiyomi-muted">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="p-6 text-center text-kiyomi-muted">Loading...</td></tr>
            ) : data?.orders.length ? (
              data.orders.map((o) => (
                <tr key={o.id} className="border-b border-kiyomi-sandDark last:border-0">
                  <td className="p-3">
                    <Link href={`/admin/orders/${o.id}`} className="underline">{o.orderNumber}</Link>
                  </td>
                  <td className="p-3">
                    <div>{o.customerName}</div>
                    <div className="text-xs text-kiyomi-muted">{o.customerEmail}</div>
                  </td>
                  <td className="p-3">{o.itemCount}</td>
                  <td className="p-3">{formatPrice(o.totalCents)}</td>
                  <td className="p-3">
                    <span className="rounded bg-kiyomi-sand px-2 py-1 text-xs">{o.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="p-3">{o.paymentStatus}</td>
                  <td className="p-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="p-6 text-center text-kiyomi-muted">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="border px-3 py-1 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-2 py-1 text-sm">Page {data.pagination.page} of {data.pagination.totalPages}</span>
          <button
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border px-3 py-1 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}