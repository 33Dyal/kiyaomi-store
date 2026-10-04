import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

export const GET = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "STAFF");

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("search") || undefined;
  const lowStockOnly = searchParams.get("lowStockOnly") === "true";

  const variants = await prisma.productVariant.findMany({
    where: {
      product: {
        deletedAt: null,
        ...(q
          ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] }
          : {}),
      },
    },
    include: {
      product: { select: { name: true, sku: true, slug: true } },
      inventory: true,
    },
    orderBy: { product: { name: "asc" } },
  });

  const rows = variants
    .map((v) => ({
      variantId: v.id,
      productName: v.product.name,
      productSlug: v.product.slug,
      sku: v.product.sku,
      variantLabel: [v.size, v.color].filter(Boolean).join(" / ") || null,
      quantity: v.inventory?.quantity ?? 0,
      lowStockThreshold: v.inventory?.lowStockThreshold ?? 5,
    }))
    .filter((r) => !lowStockOnly || r.quantity <= r.lowStockThreshold)
    .sort((a, b) => a.quantity - b.quantity);

  return ok({ variants: rows });
});