"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/brand";
import { AlertTriangle } from "lucide-react";

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
  });

  if (isLoading || !data) return <div>Loading...</div>;

  const stats = [
    { label: "Orders (all time)", value: data.totalOrders },
    { label: "Pending orders", value: data.pendingOrders },
    { label: "Revenue this month", value: formatPrice(data.monthRevenueCents) },
    { label: "Revenue today", value: formatPrice(data.todayRevenueCents) },
    { label: "Customers", value: data.totalCustomers },
  ];

  return (
    <div>
      <h1 className="text-2xl">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="border border-kiyomi-sandDark bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-kiyomi-muted">{s.label}</p>
            <p className="mt-1 text-xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="border border-kiyomi-sandDark bg-white">
          <h2 className="border-b border-kiyomi-sandDark p-4 text-sm uppercase tracking-wide">Recent orders</h2>
          <div className="divide-y divide-kiyomi-sandDark">
            {data.recentOrders.length === 0 ? (
              <p className="p-4 text-sm text-kiyomi-muted">No orders yet.</p>
            ) : (
              data.recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between p-4 text-sm hover:bg-kiyomi-sand"
                >
                  <div>
                    <p className="underline">{o.orderNumber}</p>
                    <p className="text-xs text-kiyomi-muted">{o.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p>{formatPrice(o.totalCents)}</p>
                    <p className="text-xs text-kiyomi-muted">{o.status.replace(/_/g, " ")}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="border border-kiyomi-sandDark bg-white">
          <h2 className="flex items-center gap-2 border-b border-kiyomi-sandDark p-4 text-sm uppercase tracking-wide">
            <AlertTriangle className="h-4 w-4 text-kiyomi-terracotta" />
            Low stock
          </h2>
          <div className="divide-y divide-kiyomi-sandDark">
            {data.lowStock.length === 0 ? (
              <p className="p-4 text-sm text-kiyomi-muted">Nothing running low.</p>
            ) : (
              data.lowStock.map((item, i) => (
                <Link
                  key={i}
                  href={`/admin/products?search=${encodeURIComponent(item.productSlug)}`}
                  className="flex items-center justify-between p-4 text-sm hover:bg-kiyomi-sand"
                >
                  <div>
                    <p>{item.productName}</p>
                    {item.variantLabel && <p className="text-xs text-kiyomi-muted">{item.variantLabel}</p>}
                  </div>
                  <span className="text-kiyomi-terracotta">{item.quantity} left</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}