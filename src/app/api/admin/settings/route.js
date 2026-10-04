import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { uploadImage } from "@/lib/cloudinary/client";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { z } from "zod";

const updateSchema = z.object({
  storeName: z.string().min(1).optional(),
  logoUrl: z.string().optional(), // base64 data URI or existing URL, or "" to clear
  contactEmail: z.string().email().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),
  currency: z.string().min(1).optional(),
  freeShippingThresholdCents: z.number().int().min(0).nullable().optional(),
  taxPercentage: z.number().int().min(0).max(100).nullable().optional(),
  returnPeriodDays: z.number().int().min(0).optional(),
  announcement: z.string().nullable().optional(),
});

export const GET = withErrorHandling(async () => {
  await requireRole("ADMIN", "STAFF");

  const settings = await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return ok({ settings });
});

export const PATCH = withErrorHandling(async (req) => {
  await requireRole("ADMIN"); // store-wide config is admin-only, not staff

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid settings", 422);
  const data = parsed.data;

  if (data.logoUrl?.startsWith("data:")) {
    const result = await uploadImage(data.logoUrl, { folder: "kiyomi/branding" });
    data.logoUrl = result.secure_url;
  }

  const settings = await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  return ok({ settings });
});