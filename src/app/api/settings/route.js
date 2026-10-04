import { prisma } from "@/lib/db/prisma";
import { ok, withErrorHandling } from "@/lib/utils/api-response";

// Public-facing store config — only safe, non-sensitive fields are exposed here.
// Full settings (admin editing) stay behind /api/admin/settings.
export const GET = withErrorHandling(async () => {
  const settings = await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return ok({
    storeName: settings.storeName,
    logoUrl: settings.logoUrl,
    announcement: settings.announcement,
    currency: settings.currency,
    freeShippingThresholdCents: settings.freeShippingThresholdCents,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    whatsappNumber: settings.whatsappNumber,
  });
});