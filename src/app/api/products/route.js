import { prisma } from "@/lib/db/prisma";
import { ok, withErrorHandling } from "@/lib/utils/api-response";
import { buildProductWhere, resolveSort, productListInclude, serializeProductCard } from "@/lib/products/queries";

export const GET = withErrorHandling(async (req) => {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category") || undefined;
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 12);

  const where = buildProductWhere({ categorySlug });
  const orderBy = resolveSort(sort);

  const [totalItems, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productListInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return ok({
    products: products.map(serializeProductCard),
    pagination: { page, totalPages, totalItems, pageSize },
  });
});