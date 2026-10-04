import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log("Connected! Product count:", count);
}

main()
  .catch((e) => console.error("FAILED:", e))
  .finally(() => prisma.$disconnect());