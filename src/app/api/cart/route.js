import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { z } from "zod";

// ...keep your existing validateSchema and POST handler unchanged above this...

const syncSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().nullable(),
    quantity: z.number().int().positive(),
  })),
});

// Loads the logged-in user's saved cart from the DB.
export const GET = withErrorHandling(async () => {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHORIZED", "Not signed in", 401);

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } },
          variant: true,
        },
      },
    },
  });

  const items = (cart?.items ?? []).map((ci) => ({
    productId: ci.productId,
    variantId: ci.variantId,
    name: ci.product.name,
    image: ci.product.images[0]?.url,
    unitPriceCents: ci.variant?.priceCents ?? ci.product.priceCents,
    quantity: ci.quantity,
    size: ci.variant?.size ?? null,
    color: ci.variant?.color ?? null,
    slug: ci.product.slug,
  }));

  return ok({ items });
});

// Persists the full current cart for the logged-in user (replace-all).
export const PUT = withErrorHandling(async (req) => {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHORIZED", "Not signed in", 401);

  const parsed = syncSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Invalid cart payload", 422);

  const { items } = parsed.data;

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
    ...(items.length > 0
      ? [prisma.cartItem.createMany({
          data: items.map((i) => ({
            cartId: cart.id,
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        })]
      : []),
  ]);

  return ok({ saved: true });
});