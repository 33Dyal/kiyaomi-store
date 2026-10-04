import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { uploadImage } from "@/lib/cloudinary/client";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { z } from "zod";

const variantSchema = z.object({
  id: z.string().optional(), // present = update existing, absent = create new
  size: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  priceCents: z.number().int().positive().nullable().optional(),
  quantity: z.number().int().min(0),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  materials: z.string().nullable().optional(),
  careInstructions: z.string().nullable().optional(),
  categoryId: z.string().min(1).optional(),
  priceCents: z.number().int().positive().optional(),
  salePriceCents: z.number().int().positive().nullable().optional(),
  isFeatured: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  images: z.array(z.string()).optional(), // full replacement list when provided
  variants: z.array(variantSchema).optional(), // full replacement list when provided
  removedVariantIds: z.array(z.string()).optional(),
});

export const GET = withErrorHandling(async (req, { params }) => {
  await requireRole("ADMIN", "STAFF");
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { include: { inventory: true } },
    },
  });
  if (!product || product.deletedAt) return apiError("NOT_FOUND", "Product not found", 404);

  return ok({ product });
});

export const PATCH = withErrorHandling(async (req, { params }) => {
  await requireRole("ADMIN", "STAFF");
  const { id } = await params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) return apiError("NOT_FOUND", "Product not found", 404);

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid update", 422);
  const data = parsed.data;

  const {
    images, variants, removedVariantIds,
    ...productFields
  } = data;

  await prisma.product.update({ where: { id }, data: productFields });

  if (images) {
    const uploadedImages = [];
    for (const img of images) {
      if (img.startsWith("data:")) {
        const result = await uploadImage(img);
        uploadedImages.push(result.secure_url);
      } else {
        uploadedImages.push(img);
      }
    }
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productImage.createMany({
      data: uploadedImages.map((url, i) => ({ productId: id, url, sortOrder: i })),
    });
  }

  if (removedVariantIds?.length) {
    await prisma.productVariant.deleteMany({ where: { id: { in: removedVariantIds }, productId: id } });
  }

  if (variants) {
    for (const v of variants) {
      if (v.id) {
        await prisma.productVariant.update({
          where: { id: v.id },
          data: { size: v.size || null, color: v.color || null, priceCents: v.priceCents || null },
        });
        await prisma.inventory.upsert({
          where: { variantId: v.id },
          update: { quantity: v.quantity },
          create: { variantId: v.id, quantity: v.quantity, lowStockThreshold: 5 },
        });
      } else {
        const newVariant = await prisma.productVariant.create({
          data: { productId: id, size: v.size || null, color: v.color || null, priceCents: v.priceCents || null },
        });
        await prisma.inventory.create({
          data: { variantId: newVariant.id, quantity: v.quantity, lowStockThreshold: 5 },
        });
      }
    }
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } }, variants: { include: { inventory: true } } },
  });

  return ok({ product });
});

export const DELETE = withErrorHandling(async (req, { params }) => {
  await requireRole("ADMIN", "STAFF");
  const { id } = await params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) return apiError("NOT_FOUND", "Product not found", 404);

  await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });

  return ok({ deleted: true });
});