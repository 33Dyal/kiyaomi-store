import { prisma } from "@/lib/db/prisma";
import { notifyCustomer, notifyAdmins } from "@/lib/notifications";

/**
 * Safaricom's async STK Push result callback — the ONLY place an M-Pesa
 * order is ever marked PAID, mirroring the Stripe webhook's role. Unlike
 * Stripe, Daraja callbacks aren't cryptographically signed; trust instead
 * comes from this URL being known only to Safaricom (registered at STK
 * Push initiation) and never exposed to the client. Consider adding IP
 * allowlisting for Safaricom's published callback IP ranges in production.
 */
export async function POST(req) {
  const body = await req.json();
  const callback = body?.Body?.stkCallback;
  if (!callback) return Response.json({ received: true });

  const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback;

  const order = await prisma.order.findUnique({
    where: { mpesaCheckoutRequestId: CheckoutRequestID },
    include: { items: true, coupon: true, user: true },
  });
  if (!order || order.paymentStatus === "PAID") {
    return Response.json({ received: true }); // idempotent, and unknown requests are ignored
  }

  if (ResultCode !== 0) {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "FAILED", status: "CANCELLED" },
    });
    return Response.json({ received: true });
  }

  const metadata = Object.fromEntries(
    (CallbackMetadata?.Item ?? []).map((i) => [i.Name, i.Value])
  );
  const mpesaReceiptNumber = metadata.MpesaReceiptNumber;
  const phoneNumber = String(metadata.PhoneNumber ?? "");
  const amountCents = Math.round(Number(metadata.Amount ?? 0) * 100);

  const shortages = [];
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      if (!item.variantId) continue;
      const result = await tx.inventory.updateMany({
        where: { variantId: item.variantId, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });
      if (result.count === 0) {
        shortages.push(item);
      } else {
        const inv = await tx.inventory.findUnique({ where: { variantId: item.variantId } });
        await tx.inventoryHistory.create({
          data: { inventoryId: inv.id, change: -item.quantity, reason: `order:${order.orderNumber}` },
        });
      }
    }

    await tx.payment.create({
      data: {
        orderId: order.id,
        provider: "MPESA",
        mpesaReceiptNumber,
        phoneNumber,
        amountCents,
        currency: order.currency,
        status: "PAID",
        rawEventPayload: body,
      },
    });

    if (order.couponId) {
      await tx.couponUsage.create({ data: { couponId: order.couponId, userId: order.userId, orderId: order.id } });
    }

    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID", status: "CONFIRMED" },
    });
  });

  if (shortages.length > 0) {
    await notifyAdmins({
      title: "Order needs review — possible overselling",
      body: `Order ${order.orderNumber} paid but ${shortages.length} item(s) had insufficient stock at fulfillment time. Manual review required.`,
    });
  }

  await notifyAdmins({ title: "New order", body: `Order ${order.orderNumber} — M-Pesa payment confirmed.` });
  await notifyCustomer({
    userId: order.userId,
    title: "Payment confirmed",
    body: `Your order ${order.orderNumber} has been confirmed.`,
    email: order.user.email,
    subject: `Kiyomi — order ${order.orderNumber} confirmed`,
    html: `<p>Hi ${order.user.firstName}, we've received your M-Pesa payment for order <strong>${order.orderNumber}</strong> (receipt ${mpesaReceiptNumber}). We'll notify you as it ships.</p>`,
  });

  return Response.json({ received: true });
}