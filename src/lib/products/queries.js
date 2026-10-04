import { prisma } from "@/lib/db/prisma";

/**
 * Shared product query builder used by both /api/products (customer shop
 * page) and /api/admin/products (admin table) so filtering/sorting logic
 * lives in one place instead of being duplicated per route.
 */
export function buildProductWhere({ categorySlug, q, minPrice, maxPrice, size, color, inStock, featured, bestseller, newArrival, publishedOnly = true }) {
  const where = { deletedAt: null };
  if (publishedOnly) where.isPublished = true;
  if (categorySlug) where.category = { slug: categorySlug };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { has: q.toLowerCase() } },
    ];
  }
  if (minPrice != null || maxPrice != null) {
    where.priceCents = {};
    if (minPrice != null) where.priceCents.gte = minPrice;
    if (maxPrice != null) where.priceCents.lte = maxPrice;
  }
  if (featured) where.isFeatured = true;
  if (bestseller) where.isBestseller = true;
  if (newArrival) where.isNewArrival = true;
  if (size || color || inStock) {
    where.variants = {
      some: {
        ...(size ? { size } : {}),
        ...(color ? { color } : {}),
        ...(inStock ? { inventory: { quantity: { gt: 0 } } } : {}),
      },
    };
  }
  return where;
}

export function resolveSort(sort) {
  switch (sort) {
    case "price-asc": return { priceCents: "asc" };
    case "price-desc": return { priceCents: "desc" };
    case "bestselling": return { isBestseller: "desc" };
    case "featured": return { isFeatured: "desc" };
    case "newest":
    default: return { createdAt: "desc" };
  }
}

export const productListInclude = {
  images: { orderBy: { sortOrder: "asc" }, take: 2 },
  category: true,
  variants: { include: { inventory: true } },
  reviews: { where: { status: "APPROVED" }, select: { rating: true } },
};

export function serializeProductCard(product) {
  const totalStock = product.variants.reduce((sum, v) => sum + (v.inventory?.quantity ?? 0), 0);
  const ratings = product.reviews.map((r) => r.rating);
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    priceCents: product.priceCents,
    salePriceCents: product.salePriceCents,
    currency: product.currency,
    image: product.images[0]?.url ?? null,
    secondaryImage: product.images[1]?.url ?? null,
    category: product.category.name,
    categorySlug: product.category.slug,
    isFeatured: product.isFeatured,
    isBestseller: product.isBestseller,
    isNewArrival: product.isNewArrival,
    inStock: totalStock > 0,
    rating: avgRating,
    reviewCount: ratings.length,
  };
}
