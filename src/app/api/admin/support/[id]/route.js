import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { notifyCustomer } from "@/lib/notifications";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"]).optional(),
  reply: z.string().min(1).optional(),
});

export const GET = withErrorHandling(async (req, { params }) => {
  await requireRole("ADMIN", "STAFF");
  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      messages: { include: { user: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!ticket) return apiError("NOT_FOUND", "Ticket not found", 404);

  return ok({
    ticket: {
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      orderNumber: ticket.orderNumber,
      imageUrl: ticket.imageUrl,
      status: ticket.status,
      customerName: `${ticket.user.firstName} ${ticket.user.lastName}`,
      customerEmail: ticket.user.email,
      customerPhone: ticket.user.phone,
      createdAt: ticket.createdAt,
      messages: ticket.messages.map((m) => ({
        id: m.id,
        message: m.message,
        isStaff: m.isStaff,
        authorName: `${m.user.firstName} ${m.user.lastName}`,
        createdAt: m.createdAt,
      })),
    },
  });
});

export const PATCH = withErrorHandling(async (req, { params }) => {
  const admin = await requireRole("ADMIN", "STAFF");
  const { id } = await params;

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid update", 422);
  const { status, reply } = parsed.data;

  const ticket = await prisma.supportTicket.findUnique({ where: { id }, include: { user: true } });
  if (!ticket) return apiError("NOT_FOUND", "Ticket not found", 404);

  if (reply) {
    await prisma.supportMessage.create({
      data: { ticketId: id, userId: admin.id, isStaff: true, message: reply },
    });
    await notifyCustomer({
      userId: ticket.userId,
      title: "Reply to your support ticket",
      body: `We've replied to your ticket: "${ticket.subject}"`,
      email: ticket.user.email,
      subject: `Re: ${ticket.subject} — Kiyomi Support`,
      html: `<p>Hi ${ticket.user.firstName}, we've replied to your support ticket:</p><p>${reply}</p>`,
    });
  }

  if (status) {
    await prisma.supportTicket.update({ where: { id }, data: { status } });
  } else {
    await prisma.supportTicket.update({ where: { id }, data: { updatedAt: new Date() } });
  }

  return ok({ updated: true });
});