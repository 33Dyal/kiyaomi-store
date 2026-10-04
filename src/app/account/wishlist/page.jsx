"use client";

import Image from "next/image";
import Link from "next/link";
import { useServerWishlist, useRemoveFromWishlist } from "@/hooks/use-wishlist";
import { PriceDisplay } from "@/components/products/price-display";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { useToast } from "@/components/ui/toast";
import { X } from "lucide-react";

export default function AccountWishlistPage() {
  const { data, isLoading } = useServerWishlist();
  const removeMutation = useRemoveFromWishlist();
  const addItem = useCartStore((s) => s.addItem);
  const { push } = useToast();

  if (isLoading) return <p className="px-4 py-10 text-sm text-kiyomi-muted">Loading your wishlist…</p>;

  const items = data?.items || [];

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Items you save while signed in will appear here."
        action={<Button as={Link} href="/shop">Browse the shop</Button>}
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 border border-kiyomi-sandDark p-4">
          <Link href={`/products/${item.slug}`} className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-kiyomi-sandDark">
            {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
          </Link>
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex justify-between gap-2">
              <div>
                <Link href={`/products/${item.slug}`} className="text-sm hover:underline">{item.name}</Link>
                <PriceDisplay priceCents={item.priceCents} salePriceCents={item.salePriceCents} currency={item.currency} />
              </div>
              <button onClick={() => removeMutation.mutate(item.productId)} aria-label={`Remove ${item.name}`}>
                <X className="h-4 w-4 text-kiyomi-muted" />
              </button>
            </div>
            <Button
              variant="secondary"
              disabled={!item.inStock}
              onClick={() => {
                addItem({
                  productId: item.productId, variantId: null, name: item.name, image: item.image,
                  unitPriceCents: item.salePriceCents ?? item.priceCents, quantity: 1, maxQuantity: 99,
                });
                push({ type: "success", message: "Moved to cart" });
              }}
              className="mt-2 text-xs"
            >
              {item.inStock ? "Move to cart" : "Out of stock"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
