import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { z } from "zod";

const adjustSchema = z.object({
  quantity: z.number().int().min(0),
  reason: z.string().min(1).default("manual-adjustment"),
});

export const PATCH = withErrorHandling(async (req, { params }) => {
  const admin = await requireRole("ADMIN", "STAFF");
  const { variantId } = await params;

  const parsed = adjustSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid quantity", 422);
  const { quantity, reason } = parsed.data;

  const inventory = await prisma.inventory.findUnique({ where: { variantId } });
  if (!inventory) return apiError("NOT_FOUND", "Inventory record not found", 404);

  const change = quantity - inventory.quantity;

  await prisma.$transaction([
    prisma.inventory.update({ where: { variantId }, data: { quantity } }),
    prisma.inventoryHistory.create({
      data: { inventoryId: inventory.id, change, reason: `${reason} (by ${admin.email})` },
    }),
  ]);

  return ok({ quantity });
});

export const GET = withErrorHandling(async (req, { params }) => {
  await requireRole("ADMIN", "STAFF");
  const { variantId } = await params;

  const inventory = await prisma.inventory.findUnique({
    where: { variantId },
    include: { history: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!inventory) return apiError("NOT_FOUND", "Inventory record not found", 404);

  return ok({ history: inventory.history });
});