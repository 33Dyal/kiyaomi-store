"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/brand";

const STATUS_OPTIONS = ["", "REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUNDED"];

export default function AdminReturnsPage() {
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-returns", status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/returns?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data.returns;
    },
  });

  return (
    <div>
      <h1 className="text-2xl">Returns</h1>

      <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-6 border px-3 py-2 text-sm">
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s ? s.replace(/_/g, " ") : "All statuses"}</option>
        ))}
      </select>

      <div className="mt-6 border border-kiyomi-sandDark bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-kiyomi-sandDark text-left text-xs uppercase tracking-wide text-kiyomi-muted">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Requested</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-6 text-center text-kiyomi-muted">Loading...</td></tr>
            ) : data?.length ? (
              data.map((r) => (
                <tr key={r.id} className="border-b border-kiyomi-sandDark last:border-0">
                  <td className="p-3"><Link href={`/admin/returns/${r.id}`} className="underline">{r.orderNumber}</Link></td>
                  <td className="p-3">
                    <div>{r.customerName}</div>
                    <div className="text-xs text-kiyomi-muted">{r.customerEmail}</div>
                  </td>
                  <td className="p-3 max-w-xs truncate">{r.reason}</td>
                  <td className="p-3">{formatPrice(r.totalCents)}</td>
                  <td className="p-3"><span className="rounded bg-kiyomi-sand px-2 py-1 text-xs">{r.status}</span></td>
                  <td className="p-3">{new Date(r.requestedAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="p-6 text-center text-kiyomi-muted">No return requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}