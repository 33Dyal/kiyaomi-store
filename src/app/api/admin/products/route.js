import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { uploadImage } from "@/lib/cloudinary/client";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { z } from "zod";

const variantSchema = z.object({
  size: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  priceCents: z.number().int().positive().nullable().optional(),
  quantity: z.number().int().min(0).default(0),
});

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().min(1),
  materials: z.string().optional(),
  careInstructions: z.string().optional(),
  categoryId: z.string().min(1),
  priceCents: z.number().int().positive(),
  salePriceCents: z.number().int().positive().nullable().optional(),
  isFeatured: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  images: z.array(z.string()).default([]), // base64 data URIs or existing URLs
  variants: z.array(variantSchema).min(1),
});

export const GET = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "STAFF");

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("search") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 20);

  const where = {
    deletedAt: null,
    ...(categoryId ? { categoryId } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [totalItems, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { include: { inventory: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return ok({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      categoryName: p.category.name,
      priceCents: p.priceCents,
      salePriceCents: p.salePriceCents,
      isPublished: p.isPublished,
      image: p.images[0]?.url ?? null,
      totalStock: p.variants.reduce((sum, v) => sum + (v.inventory?.quantity ?? 0), 0),
    })),
    pagination: { page, totalPages: Math.max(1, Math.ceil(totalItems / pageSize)), totalItems, pageSize },
  });
});

export const POST = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "STAFF");

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid product data", 422);
  const data = parsed.data;

  const existingSlug = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (existingSlug) return apiError("CONFLICT", "A product with this slug already exists", 409);
  const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (existingSku) return apiError("CONFLICT", "A product with this SKU already exists", 409);

  const uploadedImages = [];
  for (const img of data.images) {
    if (img.startsWith("data:")) {
      const result = await uploadImage(img);
      uploadedImages.push(result.secure_url);
    } else {
      uploadedImages.push(img); // already a hosted URL
    }
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      description: data.description,
      materials: data.materials || null,
      careInstructions: data.careInstructions || null,
      categoryId: data.categoryId,
      priceCents: data.priceCents,
      salePriceCents: data.salePriceCents || null,
      isFeatured: Boolean(data.isFeatured),
      isBestseller: Boolean(data.isBestseller),
      isNewArrival: data.isNewArrival ?? true,
      isPublished: Boolean(data.isPublished),
      images: { create: uploadedImages.map((url, i) => ({ url, sortOrder: i })) },
    },
  });

  for (const v of data.variants) {
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        size: v.size || null,
        color: v.color || null,
        priceCents: v.priceCents || null,
      },
    });
    await prisma.inventory.create({
      data: { variantId: variant.id, quantity: v.quantity, lowStockThreshold: 5 },
    });
  }

  return ok({ product }, 201);
});