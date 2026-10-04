"use client";

import { use, useMemo, useState } from "react";
import { useProduct } from "@/hooks/use-products";
import { PriceDisplay } from "@/components/products/price-display";
import { Rating } from "@/components/products/rating";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

export default function ProductDetailPage({ params }) {
  const { slug } = use(params);
  const { data, isLoading } = useProduct(slug);
  const addItem = useCartStore((s) => s.addItem);

  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [added, setAdded] = useState(false);

  const product = data?.product;
  const relatedProducts = data?.relatedProducts ?? [];

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find((v) => v.id === selectedVariantId) ??
      product.variants[0] ??
      null
    );
  }, [product, selectedVariantId]);

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-10">Loading...</div>;
  }

  if (!data) {
    return <div className="mx-auto max-w-7xl px-4 py-10">Product not found.</div>;
  }

  const outOfStock = !selectedVariant || !selectedVariant.inStock;

  function handleAddToCart() {
    if (!selectedVariant || outOfStock) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      image: product.images?.[0]?.url,
      unitPriceCents: selectedVariant.priceCents ?? product.salePriceCents ?? product.priceCents,
      quantity: 1,
      size: selectedVariant.size,
      color: selectedVariant.color,
      maxQuantity: selectedVariant.quantityAvailable,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
          {product.images.map((img, i) => (
            <img key={i} src={img.url} alt={product.name} className="aspect-[3/4] w-full object-cover" />
          ))}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-kiyomi-muted">{product.category.name}</p>
          <h1 className="mt-1 text-2xl">{product.name}</h1>
          <div className="mt-3">
            <PriceDisplay priceCents={product.priceCents} salePriceCents={product.salePriceCents} />
          </div>
          <div className="mt-2">
            <Rating value={product.rating} count={product.reviewCount} />
          </div>
          <p className="mt-6 text-sm leading-relaxed">{product.description}</p>

          {product.variants.length > 0 && (
            <div className="mt-6 space-y-3">
              <p className="text-xs uppercase tracking-wide text-kiyomi-muted">Select an option</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const label = [v.size, v.color].filter(Boolean).join(" / ") || v.id;
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!v.inStock}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`border px-3 py-2 text-xs uppercase tracking-wide transition-colors
                        ${isSelected ? "border-kiyomi-terracotta bg-kiyomi-terracotta text-white" : "border-kiyomi-sandDark"}
                        ${!v.inStock ? "cursor-not-allowed opacity-40 line-through" : "hover:border-kiyomi-terracotta"}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="mt-6 w-full"
          >
            {outOfStock ? "Out of stock" : added ? "Added to bag" : "Add to Cart"}
          </Button>

          {product.materials && (
            <p className="mt-4 text-xs text-kiyomi-muted">Materials: {product.materials}</p>
          )}
          {product.careInstructions && (
            <p className="text-xs text-kiyomi-muted">Care: {product.careInstructions}</p>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-lg">You may also like</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  );
}