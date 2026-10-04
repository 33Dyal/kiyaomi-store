import { z } from "zod";

export const productInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().min(1),
  materials: z.string().optional(),
  careInstructions: z.string().optional(),
  categoryId: z.string().min(1),
  priceCents: z.number().int().positive(),
  salePriceCents: z.number().int().positive().optional(),
  isFeatured: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  variants: z
    .array(
      z.object({
        size: z.string().optional(),
        color: z.string().optional(),
        priceCents: z.number().int().positive().optional(),
        quantity: z.number().int().nonnegative().default(0),
      })
    )
    .min(1),
});
