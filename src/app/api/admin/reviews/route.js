import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

export const GET = withErrorHandling(async (req) => {
  await requireRole("ADMIN", "STAFF");

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "PENDING";

  const reviews = await prisma.review.findMany({
    where: { status },
    include: {
      user: { select: { firstName: true, lastName: true } },
      product: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return ok({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      customerName: `${r.user.firstName} ${r.user.lastName}`,
      productName: r.product.name,
      productSlug: r.product.slug,
      createdAt: r.createdAt,
    })),
  });
});