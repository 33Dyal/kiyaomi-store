import { prisma } from "@/lib/db/prisma";
import { stripe } from "./client";
import { generateOrderNumber } from "@/lib/utils/order-number";
import { env } from "@/lib/env";

/**
 * The single place that turns a client-submitted cart into a priced Order
 * and a Stripe Checkout Session. Every number here is recomputed from the
 * database — product price, variant price override, delivery fee, coupon
 * discount — the client's cart is only used for *which* products/variants/
 * quantities were requested, never for what they cost (spec section 16).
 */
export async function createOrderAndCheckoutSession({ user, items, address, deliveryMethodId, couponCode }) {
  if (!items?.length) throw errorWith(422, "Your cart is empty");

  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isPublished: true, deletedAt: null },
    include: { variants: { include: { inventory: true } } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const orderItemsData = [];
  let subtotalCents = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) throw errorWith(400, "One of the items in your cart is no longer available");
    const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : product.variants[0];
    if (!variant) throw errorWith(400, `${product.name} is no longer available in that option`);

    const available = variant.inventory?.quantity ?? 0;
    if (available < item.quantity) {
      throw errorWith(409, `Only ${available} left of ${product.name}${variant.size ? ` (${variant.size})` : ""}`);
    }

    const unitPriceCents = variant.priceCents ?? product.priceCents;
    const lineTotal = unitPriceCents * item.quantity;
    subtotalCents += lineTotal;

    orderItemsData.push({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantLabel: [variant.size, variant.color].filter(Boolean).join(" / ") || null,
      unitPriceCents,
      quantity: item.quantity,
      totalCents: lineTotal,
    });
  }

  const deliveryMethod = await prisma.deliveryMethod.findUnique({ where: { id: deliveryMethodId } });
  if (!deliveryMethod || !deliveryMethod.isActive) throw errorWith(400, "Select a valid delivery method");

  const settings = await prisma.storeSettings.findUnique({ where: { id: "singleton" } });
  const freeThreshold = settings?.freeShippingThresholdCents;
  const deliveryFeeCents = freeThreshold != null && subtotalCents >= freeThreshold ? 0 : deliveryMethod.baseFeeCents;

  let discountCents = 0;
  let coupon = null;
  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
      discountCents = coupon.type === "PERCENTAGE"
        ? Math.round((subtotalCents * coupon.percentage) / 100)
        : coupon.fixedAmountCents;
      if (coupon.maxDiscountCents) discountCents = Math.min(discountCents, coupon.maxDiscountCents);
      discountCents = Math.min(discountCents, subtotalCents);
    } else {
      coupon = null; // silently drop an invalid/expired code rather than block checkout
    }
  }

  const taxCents = settings?.taxPercentage
    ? Math.round(((subtotalCents - discountCents) * settings.taxPercentage) / 100)
    : 0;
  const totalCents = subtotalCents - discountCents + deliveryFeeCents + taxCents;

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: user.id,
      addressId: address.id,
      subtotalCents, discountCents, deliveryFeeCents, taxCents, totalCents,
      currency: "KES",
      couponId: coupon?.id,
      deliveryMethodId: deliveryMethod.id,
      status: "PENDING",
      paymentStatus: "PENDING",
      items: { create: orderItemsData },
    },
    include: { items: true },
  });

  // Stripe Checkout Sessions only accept a discount via a real Stripe
  // Coupon/PromotionCode object, not an arbitrary cents amount on ad-hoc
  // price_data line items — so when our own Coupon model produced a
  // discount, mint a one-time-use Stripe coupon for exactly that amount
  // and attach it to the session.
  let stripeDiscount;
  if (discountCents > 0) {
    const stripeCoupon = await stripe.coupons.create({
      amount_off: discountCents,
      currency: "kes",
      duration: "once",
      name: coupon?.code ?? "Discount",
    });
    stripeDiscount = [{ coupon: stripeCoupon.id }];
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: order.items.map((i) => ({
      quantity: i.quantity,
      price_data: {
        currency: "kes",
        unit_amount: i.unitPriceCents,
        product_data: { name: `${i.productName}${i.variantLabel ? ` (${i.variantLabel})` : ""}` },
      },
    })).concat(
      deliveryFeeCents > 0
        ? [{ quantity: 1, price_data: { currency: "kes", unit_amount: deliveryFeeCents, product_data: { name: "Delivery" } } }]
        : []
    ).concat(
      taxCents > 0
        ? [{ quantity: 1, price_data: { currency: "kes", unit_amount: taxCents, product_data: { name: "Tax" } } }]
        : []
    ),
    ...(stripeDiscount ? { discounts: stripeDiscount } : { allow_promotion_codes: false }),
    success_url: `${env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${order.orderNumber}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=1`,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
  });

  await prisma.order.update({ where: { id: order.id }, data: { stripeCheckoutSessionId: session.id } });

  return { order, checkoutUrl: session.url };
}

function errorWith(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
