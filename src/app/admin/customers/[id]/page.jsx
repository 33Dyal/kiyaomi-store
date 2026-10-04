"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@/lib/brand";
import { useToast } from "@/components/ui/toast";

export default function AdminCustomerDetailPage({ params }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-customer", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/customers/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data.customer;
    },
  });

  async function updateField(field, value) {
    setSaving(true);
    const res = await fetch(`/api/admin/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) {
      push({ type: "error", message: json.error.message });
      return;
    }
    push({ type: "success", message: "Customer updated" });
    queryClient.invalidateQueries({ queryKey: ["admin-customer", id] });
    queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
  }

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Customer not found.</div>;

  return (
    <div>
      <h1 className="text-2xl">{data.name}</h1>
      <p className="text-sm text-kiyomi-muted">{data.email} — {data.phone || "no phone"}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="border border-kiyomi-sandDark bg-white">
            <h2 className="border-b border-kiyomi-sandDark p-4 text-sm uppercase tracking-wide">Recent orders</h2>
            <div className="divide-y divide-kiyomi-sandDark">
              {data.orders.length === 0 ? (
                <p className="p-4 text-sm text-kiyomi-muted">No orders yet.</p>
              ) : (
                data.orders.map((o) => (
                  <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between p-4 text-sm hover:bg-kiyomi-sand">
                    <span className="underline">{o.orderNumber}</span>
                    <span>{formatPrice(o.totalCents)}</span>
                    <span className="text-xs text-kiyomi-muted">{o.status.replace(/_/g, " ")}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="border border-kiyomi-sandDark bg-white p-4">
            <h2 className="mb-2 text-sm uppercase tracking-wide">Addresses</h2>
            {data.addresses.length === 0 ? (
              <p className="text-sm text-kiyomi-muted">No saved addresses.</p>
            ) : (
              <div className="space-y-2 text-sm">
                {data.addresses.map((a) => (
                  <p key={a.id}>{a.fullName} — {a.street}, {a.area}, {a.city}, {a.county}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="h-fit space-y-4 border border-kiyomi-sandDark bg-white p-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Role</label>
            <select
              value={data.role}
              disabled={saving}
              onChange={(e) => updateField("role", e.target.value)}
              className="mt-1 w-full border px-3 py-2 text-sm"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Account status</label>
            <button
              disabled={saving}
              onClick={() => updateField("isActive", !data.isActive)}
              className={`mt-1 w-full border px-3 py-2 text-sm ${data.isActive ? "text-red-700" : "text-green-700"}`}
            >
              {data.isActive ? "Deactivate account" : "Reactivate account"}
            </button>
          </div>
          <p className="text-xs text-kiyomi-muted">
            Verified: {data.emailVerified ? "Yes" : "No"} — Joined {new Date(data.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}