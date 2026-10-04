import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(7),
  country: z.string().default("Kenya"),
  county: z.string().min(1),
  city: z.string().min(1),
  area: z.string().min(1),
  street: z.string().min(1),
  apartment: z.string().optional(),
  instructions: z.string().optional(),
});

export const createOrderSchema = z.object({
  addressId: z.string().min(1).optional(),
  newAddress: addressSchema.optional(),
  deliveryMethodId: z.string().min(1),
  couponCode: z.string().optional(),
}).refine((d) => d.addressId || d.newAddress, {
  message: "An address is required",
});
