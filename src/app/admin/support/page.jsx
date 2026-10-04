"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

const STATUS_OPTIONS = ["", "OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"];

export default function AdminSupportPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-support", status, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/support?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl">Support</h1>

      <select
        value={status}
        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        className="mt-6 border px-3 py-2 text-sm"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s ? s.replace(/_/g, " ") : "All statuses"}</option>
        ))}
      </select>

      <div className="mt-6 border border-kiyomi-sandDark bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-kiyomi-sandDark text-left text-xs uppercase tracking-wide text-kiyomi-muted">
              <th className="p-3">Subject</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Category</th>
              <th className="p-3">Order</th>
              <th className="p-3">Status</th>
              <th className="p-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-6 text-center text-kiyomi-muted">Loading...</td></tr>
            ) : data?.tickets.length ? (
              data.tickets.map((t) => (
                <tr key={t.id} className="border-b border-kiyomi-sandDark last:border-0">
                  <td className="p-3">
                    <Link href={`/admin/support/${t.id}`} className="underline">{t.subject}</Link>
                  </td>
                  <td className="p-3">
                    <div>{t.customerName}</div>
                    <div className="text-xs text-kiyomi-muted">{t.customerEmail}</div>
                  </td>
                  <td className="p-3">{t.category}</td>
                  <td className="p-3">{t.orderNumber || "—"}</td>
                  <td className="p-3">
                    <span className="rounded bg-kiyomi-sand px-2 py-1 text-xs">{t.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="p-3">{new Date(t.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="p-6 text-center text-kiyomi-muted">No tickets found.</td></tr>
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