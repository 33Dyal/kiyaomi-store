"use client";

import Link from "next/link";
import { useMyOrders } from "@/hooks/use-order";
import { formatPrice } from "@/lib/brand";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusTone = {
  DELIVERED: "default", CANCELLED: "outline", REFUNDED: "outline",
};

export default function AccountOrdersPage() {
  const { data, isLoading } = useMyOrders();
  if (isLoading) return <p className="text-sm text-kiyomi-muted">Loading orders…</p>;

  const orders = data?.orders || [];
  if (orders.length === 0) {
    return (
      <EmptyState title="No orders yet" description="Your order history will appear here." action={<Button as={Link} href="/shop">Shop now</Button>} />
    );
  }

  return (
    <div className="divide-y divide-kiyomi-sandDark border border-kiyomi-sandDark">
      {orders.map((o) => (
        <Link key={o.id} href={`/orders/${o.orderNumber}`} className="flex items-center justify-between p-4 text-sm hover:bg-kiyomi-sand">
          <div>
            <p>{o.orderNumber}</p>
            <p className="text-xs text-kiyomi-muted">{new Date(o.createdAt).toLocaleDateString()} · {o.itemCount} items</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={statusTone[o.status] || "default"}>{o.status.replace(/_/g, " ")}</Badge>
            <span>{formatPrice(o.totalCents, o.currency)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
