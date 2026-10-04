"use client";

import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@/lib/brand";
import { useToast } from "@/components/ui/toast";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED"];

export default function AdminOrderDetailPage({ params }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/orders/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data.order;
    },
  });

  async function updateStatus(newStatus) {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) {
      push({ type: "error", message: json.error.message });
      return;
    }
    push({ type: "success", message: "Order updated" });
    queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
  }

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Order not found.</div>;

  return (
    <div>
      <h1 className="text-2xl">{data.orderNumber}</h1>
      <p className="text-sm text-kiyomi-muted">
        {data.user.firstName} {data.user.lastName} — {data.user.email} — {data.user.phone}
      </p>

      <div className="mt-6 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="border border-kiyomi-sandDark bg-white">
            <div className="divide-y divide-kiyomi-sandDark">
              {data.items.map((item) => (
                <div key={item.id} className="flex justify-between p-3 text-sm">
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

          <div className="border border-kiyomi-sandDark bg-white p-4 text-sm">
            <h2 className="mb-2 font-medium">Delivery address</h2>
            <p>{data.address.fullName} — {data.address.phone}</p>
            <p>{data.address.street}, {data.address.area}, {data.address.city}, {data.address.county}</p>
            {data.address.instructions && <p className="text-xs text-kiyomi-muted">{data.address.instructions}</p>}
          </div>

          <div className="border border-kiyomi-sandDark bg-white p-4 text-sm">
            <h2 className="mb-2 font-medium">Payments</h2>
            {data.payments.length === 0 ? (
              <p className="text-kiyomi-muted">No payment records yet.</p>
            ) : (
              data.payments.map((p) => (
                <div key={p.id} className="flex justify-between border-b border-kiyomi-sandDark py-2 last:border-0">
                  <span>{p.provider} — {p.status}</span>
                  <span>{formatPrice(p.amountCents)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="h-fit border border-kiyomi-sandDark bg-white p-4">
          <h2 className="mb-3 text-sm uppercase tracking-wide">Order status</h2>
          <select
            value={data.status}
            disabled={saving}
            onChange={(e) => updateStatus(e.target.value)}
            className="w-full border px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
          <p className="mt-3 text-xs text-kiyomi-muted">Payment: {data.paymentStatus}</p>

          <div className="mt-4 space-y-1 border-t border-kiyomi-sandDark pt-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(data.subtotalCents)}</span></div>
            {data.discountCents > 0 && <div className="flex justify-between"><span>Discount</span><span>−{formatPrice(data.discountCents)}</span></div>}
            <div className="flex justify-between"><span>Delivery</span><span>{formatPrice(data.deliveryFeeCents)}</span></div>
            <div className="flex justify-between border-t border-kiyomi-sandDark pt-2 font-medium"><span>Total</span><span>{formatPrice(data.totalCents)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}