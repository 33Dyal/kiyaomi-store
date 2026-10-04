import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { createOrderAndCheckoutSession } from "@/lib/stripe/checkout-session";
import { addressSchema } from "@/schemas/checkout";
import { ok, apiError, withErrorHandling } from "@/lib/utils/api-response";
import { z } from "zod";

const bodySchema = z.object({
  items: z.array(z.object({
    productId: z.string(), variantId: z.string().nullable(), quantity: z.number().int().positive(),
  })).min(1),
  addressId: z.string().optional(),
  newAddress: addressSchema.optional(),
  deliveryMethodId: z.string().min(1),
  couponCode: z.string().optional(),
}).refine((d) => d.addressId || d.newAddress, { message: "An address is required" });

// Named create-intent to match the API map in the spec, though internally
// this creates a Stripe Checkout Session (redirect-based, per section 15)
// rather than a raw PaymentIntent — Checkout Session is the simpler
// correct-by-default choice since Stripe hosts the card form entirely,
// so this app never touches raw card data.
export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid checkout payload", 422);
  }
  const { items, addressId, newAddress, deliveryMethodId, couponCode } = parsed.data;

  let address;
  if (addressId) {
    address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== user.id) return apiError("NOT_FOUND", "Address not found", 404);
  } else {
    address = await prisma.address.create({ data: { ...newAddress, userId: user.id } });
  }

  const { order, checkoutUrl } = await createOrderAndCheckoutSession({
    user, items, address, deliveryMethodId, couponCode,
  });

  return ok({ orderNumber: order.orderNumber, checkoutUrl });
});
