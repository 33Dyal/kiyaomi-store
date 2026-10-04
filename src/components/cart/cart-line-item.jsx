"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { PriceDisplay } from "@/components/products/price-display";
import { useCartStore } from "@/stores/cart-store";

export function CartLineItem({ item, warning }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 border-b border-kiyomi-sandDark py-4">
      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-kiyomi-sandDark">
        {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between gap-2">
          <div>
            <Link href={`/products/${item.slug || ""}`} className="text-sm hover:underline">{item.name}</Link>
            <p className="text-xs text-kiyomi-muted">
              {[item.size, item.color].filter(Boolean).join(" / ")}
            </p>
          </div>
          <button onClick={() => removeItem(item.productId, item.variantId)} aria-label={`Remove ${item.name}`}>
            <X className="h-4 w-4 text-kiyomi-muted" />
          </button>
        </div>
        {warning && <p className="mt-1 text-xs text-kiyomi-terracotta">{warning}</p>}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center border border-kiyomi-sandDark">
            <button
              className="px-2 py-1 text-sm"
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              className="px-2 py-1 text-sm"
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <PriceDisplay priceCents={item.unitPriceCents * item.quantity} currency="KES" />
        </div>
      </div>
    </div>
  );
}
