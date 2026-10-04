import { PrismaClient } from "@prisma/client";

// Standard Next.js dev-mode singleton pattern to avoid exhausting DB
// connections from hot-reload creating a new PrismaClient every request.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
