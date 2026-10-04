import { prisma } from "@/lib/db/prisma";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { productListInclude, serializeProductCard } from "@/lib/products/queries";

export const GET = withErrorHandling(async (req, { params }) => {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isPublished: true, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      variants: { include: { inventory: true } },
      reviews: {
        where: { status: "APPROVED" },
        include: { user: { select: { firstName: true, lastName: true } } },
      },
    },
  });

  if (!product) return apiError("NOT_FOUND", "Product not found", 404);

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isPublished: true,
      deletedAt: null,
    },
    include: productListInclude,
    take: 4,
  });

  const detail = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: { name: product.category.name, slug: product.category.slug },
    priceCents: product.priceCents,
    salePriceCents: product.salePriceCents,
    currency: product.currency,
    description: product.description,
    materials: product.materials,
    careInstructions: product.careInstructions,
    images: product.images.map((img) => ({ url: img.url })),
    rating: product.reviews.length
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null,
    reviewCount: product.reviews.length,
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      author: `${r.user.firstName} ${r.user.lastName[0]}.`,
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      priceCents: v.priceCents ?? product.priceCents,
      inStock: (v.inventory?.quantity ?? 0) > 0,
      quantityAvailable: v.inventory?.quantity ?? 0,
    })),
  };

  return ok({
    product: detail,
    relatedProducts: related.map(serializeProductCard).map(toLegacyCardShape),
  });
});

function toLegacyCardShape(card) {
  return {
    id: card.id,
    slug: card.slug,
    name: card.name,
    priceCents: card.priceCents,
    salePriceCents: card.salePriceCents,
    currency: card.currency,
    rating: card.rating,
    reviewCount: card.reviewCount,
    images: [card.image, card.secondaryImage].filter(Boolean).map((url) => ({ url })),
    category: { name: card.category, slug: card.categorySlug },
    variants: [{ inStock: card.inStock }],
  };
}