"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Client-side cart state (Zustand, per spec section 11). This mirrors the
 * server-side Cart/CartItem tables for guests and instant UI feedback, but
 * is NEVER the source of truth for price/stock — /api/cart and
 * /api/payments/create-intent always recompute against the database.
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { productId, variantId, name, image, unitPriceCents, quantity, size, color, maxQuantity }
setItems: (items) => set({ items }),
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );
          if (existing) {
            const nextQty = Math.min(existing.quantity + item.quantity, existing.maxQuantity ?? 99);
            return {
              items: state.items.map((i) =>
                i === existing ? { ...i, quantity: nextQty } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId && i.variantId === variantId
                ? { ...i, quantity: Math.max(0, Math.min(quantity, i.maxQuantity ?? 99)) }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        })),

      clear: () => set({ items: [] }),

      subtotalCents: () =>
        get().items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "kiyomi-cart" }
  )
);
