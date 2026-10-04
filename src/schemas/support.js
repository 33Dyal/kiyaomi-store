import { z } from "zod";

export const supportTicketSchema = z.object({
  category: z.string().min(1),
  orderNumber: z.string().optional(),
  subject: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url().optional(),
});
