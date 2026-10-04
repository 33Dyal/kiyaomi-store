import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";
import { env } from "@/lib/env";
import { notifyCustomer, notifyAdmins } from "@/lib/notifications";

/**
 * Stripe webhook — the ONLY place an order is ever marked PAID. The
 * checkout success page (below) shows a friendly confirmation, but it does
 * NOT flip payment status itself; a customer reloading/spoofing that page
 * cannot mark their own order paid. Signature verification means this
 * route can only be triggered by requests actually signed by Stripe.
 */
export async function POST(req) {
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      default:
        break; // unhandled event types are fine to ignore
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err);
    // Return 500 so Stripe retries — better to reprocess than silently drop
    // a payment confirmation.
    return Response.json({ error: "Handler failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}

async function handleCheckoutCompleted(session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true, coupon: true, user: true } });
  if (!order || order.paymentStatus === "PAID") return; // idempotent — Stripe may resend events

  // Reserve stock now, transactionally and race-safely: each decrement is
  // conditioned on quantity >= requested, so two customers racing for the
  // last unit can't both succeed (spec section 28).
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
        stripePaymentIntentId: session.payment_intent,
        amountCents: session.amount_total,
        currency: order.currency,
        status: "PAID",
        rawEventPayload: session,
      },
    });

    if (order.couponId) {
      await tx.couponUsage.create({ data: { couponId: order.couponId, userId: order.userId, orderId: order.id } });
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        stripePaymentIntentId: session.payment_intent,
      },
    });
  });

  if (shortages.length > 0) {
    await notifyAdmins({
      title: "Order needs review — possible overselling",
      body: `Order ${order.orderNumber} paid but ${shortages.length} item(s) had insufficient stock at fulfillment time. Manual review required.`,
    });
  }

  await notifyAdmins({ title: "New order", body: `Order ${order.orderNumber} — payment confirmed.` });
  await notifyCustomer({
    userId: order.userId,
    title: "Payment confirmed",
    body: `Your order ${order.orderNumber} has been confirmed.`,
    email: order.user.email,
    subject: `Kiyomi — order ${order.orderNumber} confirmed`,
    html: `<p>Hi ${order.user.firstName}, we've received your payment for order <strong>${order.orderNumber}</strong>. We'll notify you as it ships.</p>`,
  });
}

async function handleCheckoutExpired(session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  await prisma.order.updateMany({
    where: { id: orderId, paymentStatus: "PENDING" },
    data: { status: "CANCELLED", paymentStatus: "FAILED" },
  });
}

async function handlePaymentFailed(paymentIntent) {
  const order = await prisma.order.findFirst({ where: { stripePaymentIntentId: paymentIntent.id } });
  if (!order) return;
  await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
}
