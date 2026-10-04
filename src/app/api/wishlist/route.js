import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { z } from "zod";

async function getOrCreateWishlist(userId) {
  let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
  if (!wishlist) wishlist = await prisma.wishlist.create({ data: { userId } });
  return wishlist;
}

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const wishlist = await getOrCreateWishlist(user.id);
  const items = await prisma.wishlistItem.findMany({
    where: { wishlistId: wishlist.id },
    include: {
      product: {
        include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, category: true, variants: { include: { inventory: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return ok({
    items: items.map((i) => ({
      id: i.id,
      productId: i.productId,
      name: i.product.name,
      slug: i.product.slug,
      image: i.product.images[0]?.url ?? null,
      priceCents: i.product.priceCents,
      salePriceCents: i.product.salePriceCents,
      currency: i.product.currency,
      category: i.product.category.name,
      inStock: i.product.variants.some((v) => (v.inventory?.quantity ?? 0) > 0),
    })),
  });
});

const addSchema = z.object({ productId: z.string().min(1) });

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const parsed = addSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", "productId is required", 422);

  const wishlist = await getOrCreateWishlist(user.id);
  await prisma.wishlistItem.upsert({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId: parsed.data.productId } },
    update: {},
    create: { wishlistId: wishlist.id, productId: parsed.data.productId },
  });
  return ok({ added: true });
});

export const DELETE = withErrorHandling(async (req) => {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return apiError("VALIDATION_ERROR", "productId is required", 422);

  const wishlist = await getOrCreateWishlist(user.id);
  await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId } });
  return ok({ removed: true });
});
