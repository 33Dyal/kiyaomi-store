import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { uploadImage } from "@/lib/cloudinary/client";
import { notifyAdmins } from "@/lib/notifications";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { z } from "zod";

const createSchema = z.object({
  category: z.string().min(1),
  orderNumber: z.string().optional(),
  subject: z.string().min(1),
  description: z.string().min(1),
  image: z.string().optional(), // base64 data URI
});

export const GET = withErrorHandling(async () => {
  const user = await requireUser();

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return ok({
    tickets: tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      category: t.category,
      orderNumber: t.orderNumber,
      status: t.status,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
  });
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid ticket", 422);
  const { category, orderNumber, subject, description, image } = parsed.data;

  let imageUrl = null;
  if (image) {
    const result = await uploadImage(image, { folder: "kiyomi/support" });
    imageUrl = result.secure_url;
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user.id,
      category,
      orderNumber: orderNumber || null,
      subject,
      description,
      imageUrl,
      status: "OPEN",
    },
  });

  await notifyAdmins({
    title: "New support ticket",
    body: `${user.firstName} ${user.lastName} opened a ticket: "${subject}"`,
  });

  return ok({ ticket }, 201);
});