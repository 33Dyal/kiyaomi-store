"use client";

import Link from "next/link";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useProductsByIds } from "@/hooks/use-wishlist";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductGridSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

// Guest-accessible wishlist (spec section 12): backed by the local Zustand
// store, resolved against live product data on load. Signed-in customers
// get a synced, permanent version at /account/wishlist instead.
export default function WishlistPage() {
  const productIds = useWishlistStore((s) => s.productIds);
  const { data, isLoading } = useProductsByIds(productIds);

  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <h1 className="text-2xl">Wishlist</h1>
      <p className="mt-1 text-sm text-kiyomi-muted">
        Saved on this device. <Link href="/login" className="underline">Sign in</Link> to keep it across devices.
      </p>

      <div className="mt-8">
        {productIds.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            description="Tap the heart on any product to save it here."
            action={<Button as={Link} href="/shop">Browse the shop</Button>}
          />
        ) : isLoading ? (
          <ProductGridSkeleton />
        ) : (
          <ProductGrid products={data?.products || []} />
        )}
      </div>
    </div>
  );
}
