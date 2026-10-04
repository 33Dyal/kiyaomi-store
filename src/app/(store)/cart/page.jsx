"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { useCartValidation } from "@/hooks/use-cart-validation";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/brand";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotalCents());
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const { data: validation, isLoading } = useCartValidation();

  // Auto-correct quantities the server says exceed live stock, so the
  // displayed subtotal always matches what checkout will actually charge.
  useEffect(() => {
    if (!validation) return;
    validation.items.forEach((v) => {
      if (v.adjusted) updateQuantity(v.productId, v.variantId, v.quantity);
    });
  }, [validation, updateQuantity]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-content px-4 py-24">
        <EmptyState
          title="Your bag is empty"
          description="Explore the collection and add something you love."
          action={<Button as="a" href="/shop">Shop now</Button>}
        />
      </div>
    );
  }

  const warningsByKey = new Map(
    (validation?.items || []).filter((v) => v.reason).map((v) => [`${v.productId}:${v.variantId}`, v.reason])
  );
  const invalidCount = (validation?.items || []).filter((v) => !v.valid).length;

  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <h1 className="text-2xl">Your bag</h1>
      <div className="mt-8 grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          {items.map((item) => (
            <CartLineItem
              key={`${item.productId}-${item.variantId}`}
              item={item}
              warning={warningsByKey.get(`${item.productId}:${item.variantId}`)}
            />
          ))}
        </div>

        <div className="h-fit border border-kiyomi-sandDark p-6">
          <h2 className="text-sm uppercase tracking-wide">Order summary</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-kiyomi-muted">Delivery and taxes calculated at checkout.</p>

          {!isLoading && invalidCount > 0 && (
            <p className="mt-3 flex items-center gap-2 text-xs text-red-700">
              <AlertTriangle className="h-3 w-3" /> Some items need attention before you can check out.
            </p>
          )}

          <Button as={Link} href="/checkout" disabled={invalidCount > 0} className="mt-6 w-full">
            Proceed to checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
