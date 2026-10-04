"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useOrder } from "@/hooks/use-order";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/brand";
import { CheckCircle2 } from "lucide-react";

// Stripe redirects here after payment. This page is purely a friendly
// confirmation screen for the customer — it never marks the order paid
// itself (that only happens in /api/payments/webhook once Stripe confirms
// the charge server-to-server), so it's safe even if someone reloads it,
// bookmarks it, or hits it without actually paying.
function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order");
  const { data, isLoading } = useOrder(orderNumber);
  const clearCart = useCartStore((s) => s.clear);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  if (isLoading) return <p className="px-4 py-24 text-center text-sm text-kiyomi-muted">Confirming your order…</p>;

  const order = data?.order;

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
      <h1 className="mt-4 text-2xl">Thank you for your order</h1>
      {order ? (
        <>
          <p className="mt-2 text-sm text-kiyomi-muted">
            Order <strong>{order.orderNumber}</strong> — {formatPrice(order.totalCents, order.currency)}
          </p>
          <p className="mt-1 text-xs text-kiyomi-muted">
            Payment status: {order.paymentStatus === "PAID" ? "Confirmed" : "Processing — this can take a moment"}
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-kiyomi-muted">We're finalizing your order confirmation.</p>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <Button as={Link} href={order ? `/orders/${order.orderNumber}` : "/account/orders"} variant="secondary">
          View order
        </Button>
        <Button as={Link} href="/shop">Continue shopping</Button>
      </div>
    </div>
  );
}
 export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}