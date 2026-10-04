import { prisma } from "@/lib/db/prisma";
import { generateOrderNumber } from "@/lib/utils/order-number";
import { initiateStkPush } from "./client";

/**
 * M-Pesa counterpart to createOrderAndCheckoutSession. Pricing/validation
 * logic is intentionally duplicated rather than shared, to avoid risking
 * a regression in the working Stripe path while this is built and tested.
 * Ends with an STK Push request instead of a Stripe session — the order is
 * only ever marked PAID by the callback route, never here.
 */
export async function createOrderAndInitiateMpesa({ user, items, address, deliveryMethodId, couponCode, phone }) {
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
      coupon = null;
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

  const { merchantRequestId, checkoutRequestId } = await initiateStkPush({
    phone,
    amountCents: totalCents,
    accountReference: order.orderNumber,
    transactionDesc: `Kiyomi order ${order.orderNumber}`,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { mpesaCheckoutRequestId: checkoutRequestId, mpesaMerchantRequestId: merchantRequestId },
  });

  return { order, checkoutRequestId };
}

function errorWith(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}