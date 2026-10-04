import { prisma } from "@/lib/db/prisma";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

export const GET = withErrorHandling(async () => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { products: { where: { isPublished: true, deletedAt: null } } },
      },
    },
  });

  return ok({
    categories: categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      productCount: c._count.products,
    })),
  });
});