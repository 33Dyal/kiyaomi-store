"use client";

import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@/lib/brand";
import { useToast } from "@/components/ui/toast";

const STATUSES = ["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUNDED"];

export default function AdminReturnDetailPage({ params }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-return", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/returns/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      const r = json.data.returnRequest;
      setNotes(r.adminNotes || "");
      return r;
      const [showReturnForm, setShowReturnForm] = useState(false);
const [returnReason, setReturnReason] = useState("");
const [submittingReturn, setSubmittingReturn] = useState(false);

async function submitReturn() {
  setSubmittingReturn(true);
  const res = await fetch("/api/returns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: order.orderNumber, reason: returnReason }),
  });
  const json = await res.json();
  setSubmittingReturn(false);
  if (!json.success) {
    push({ type: "error", message: json.error.message });
    return;
  }
  push({ type: "success", message: "Return request submitted" });
  setShowReturnForm(false);
  setReturnReason("");
}
    },
  });

  async function update(fields) {
    setSaving(true);
    const res = await fetch(`/api/admin/returns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) {
      push({ type: "error", message: json.error.message });
      return;
    }
    push({ type: "success", message: "Updated" });
    queryClient.invalidateQueries({ queryKey: ["admin-return", id] });
  }

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Not found.</div>;

  return (
    <div>
      <h1 className="text-2xl">Return — {data.order.orderNumber}</h1>
      <p className="text-sm text-kiyomi-muted">{data.customerName} — {data.customerEmail} — {data.customerPhone}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="border border-kiyomi-sandDark bg-white p-4 text-sm">
            <p className="text-xs uppercase tracking-wide text-kiyomi-muted">Customer's reason</p>
            <p className="mt-2">{data.reason}</p>
          </div>

          <div className="border border-kiyomi-sandDark bg-white">
            <h2 className="border-b border-kiyomi-sandDark p-3 text-xs uppercase tracking-wide text-kiyomi-muted">Order items</h2>
            <div className="divide-y divide-kiyomi-sandDark">
              {data.order.items.map((item, i) => (
                <div key={i} className="flex justify-between p-3 text-sm">
                  <div>
                    <p>{item.productName}</p>
                    {item.variantLabel && <p className="text-xs text-kiyomi-muted">{item.variantLabel}</p>}
                    <p className="text-xs text-kiyomi-muted">Qty {item.quantity}</p>
                  </div>
                  <span>{formatPrice(item.totalCents)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-kiyomi-sandDark bg-white p-4">
            <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Admin notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full border px-3 py-2 text-sm"
            />
            <button
              onClick={() => update({ adminNotes: notes })}
              disabled={saving}
              className="mt-2 bg-kiyomi-ink px-4 py-2 text-xs text-white disabled:opacity-50"
            >
              Save notes
            </button>
          </div>
        </div>

        <div className="h-fit space-y-4 border border-kiyomi-sandDark bg-white p-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Status</label>
            <select
              value={data.status}
              disabled={saving}
              onChange={(e) => update({ status: e.target.value })}
              className="mt-1 w-full border px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Refund status</label>
            <select
              value={data.refundStatus}
              disabled={saving}
              onChange={(e) => update({ refundStatus: e.target.value })}
              className="mt-1 w-full border px-3 py-2 text-sm"
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid (not applicable)</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
              <option value="PARTIALLY_REFUNDED">Partially refunded</option>
            </select>
            <p className="mt-1 text-xs text-kiyomi-muted">This is record-keeping only — it does not trigger an actual Stripe/M-Pesa refund.</p>
          </div>
        </div>
      </div>
    </div>
  );
}