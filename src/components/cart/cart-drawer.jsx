"use client";

import { X, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { CartLineItem } from "./cart-line-item";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/brand";

export function CartDrawer({ open, onClose }) {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotalCents());

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30" onClick={onClose}
          />
         <motion.aside
  initial={{ x: "100%" }}
  animate={{ x: 0 }}
  exit={{ x: "100%" }}
  transition={{ type: "tween", duration: 0.25 }}
  className="fixed right-0 top-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl"
  role="dialog"
  aria-label="Shopping cart"
>
           <div className="shrink-0 flex items-center justify-between border-b border-kiyomi-sandDark p-4">
    <h2 className="text-sm uppercase tracking-wide">
      Cart Summary ({items.length})
    </h2>

    <button onClick={onClose} aria-label="Close cart">
      <X className="h-5 w-5" />
    </button>
  </div>

  {/* PRODUCTS — THIS IS THE SCROLLABLE AREA */}
  <div className="px-4 py-4">
    {items.length === 0 ? (
      <EmptyState
        title="Your bag is empty"
        description="Start adding pieces you love."
        action={
          <Button
            as={Link}
            href="/shop"
            onClick={onClose}
          >
            Shop now
          </Button>
        }
      />
    ) : (
      <div className="space-y-4">
        {items.map((item) => (
          <CartLineItem
            key={`${item.productId}-${item.variantId}`}
            item={item}
          />
        ))}
      </div>
    )}
  </div>

  {/* BOTTOM SUMMARY — STAYS AT THE BOTTOM */}
  {items.length > 0 && (
    <div className="shrink-0 border-t border-kiyomi-sandDark bg-white p-4">
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      <p className="mt-1 text-xs text-kiyomi-muted">
        Delivery calculated at checkout.
      </p>

      <Button
        as={Link}
        href="/checkout"
        onClick={onClose}
        className="mt-4 w-full"
      >
        Checkout
      </Button>
    </div>
  )}
</motion.aside>
  </>
      )}
    </AnimatePresence>
  );
}
