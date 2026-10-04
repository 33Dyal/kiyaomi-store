"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "./price-display";
import { Rating } from "./rating";
import { useWishlistStore } from "@/stores/wishlist-store";
import { cn } from "@/lib/utils/cn";

export function ProductCard({ product }) {
  const { has, toggle } = useWishlistStore();
  const wished = has(product.id);
  const onSale = product.salePriceCents != null && product.salePriceCents < product.priceCents;

  const imageUrl = product.images?.[0]?.url;
  const categoryName = product.category?.name;
  const inStock = product.variants?.some((v) => v.inStock) ?? true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-kiyomi-sandDark">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-kiyomi-muted">No image</div>
          )}

          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {onSale && <Badge tone="sale">Sale</Badge>}
            {!inStock && <Badge tone="outline">Out of stock</Badge>}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id);
            }}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-2 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Heart className={cn("h-4 w-4", wished && "fill-kiyomi-terracotta text-kiyomi-terracotta")} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-white/95 py-2 text-center text-xs uppercase tracking-wide opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" /> Quick view
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-xs uppercase tracking-wide text-kiyomi-muted">{categoryName}</p>
          <p className="text-sm">{product.name}</p>
          
          <Rating value={product.rating} count={product.reviewCount} />
        </div>
      </Link>
    </motion.div>
  );
}