"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Guest wishlist storage (spec section 12). Authenticated users' wishlists
// live server-side in Wishlist/WishlistItem and sync on login.
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
      has: (productId) => get().productIds.includes(productId),
    }),
    { name: "kiyomi-wishlist" }
  )
);
