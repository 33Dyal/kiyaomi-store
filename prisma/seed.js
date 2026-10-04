/**
 * Seed data for local development.
 *
 * IMPORTANT: none of this is the real Kiyomi catalog — this build
 * environment has no way to browse @kyomi___store, so these are clearly
 * placeholder demo products (see src/lib/brand.js for the same caveat).
 * Replace via the admin product manager once real product data is
 * available. Uses Unsplash placeholder images purely so the storefront has
 * something to render locally — swap for real Cloudinary URLs in production.
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const categories = [
  { name: "New Arrivals", slug: "new-arrivals" },
  { name: "Dresses", slug: "dresses" },
  { name: "Tops", slug: "tops" },
  { name: "Bottoms", slug: "bottoms" },
  { name: "Sets", slug: "sets" },
  { name: "Shoes", slug: "shoes" },
  { name: "Bags", slug: "bags" },
  { name: "Accessories", slug: "accessories" },
];

const demoProducts = [
  {
    name: "[DEMO] Sienna wrap dress", slug: "demo-sienna-wrap-dress", sku: "KYM-DEMO-001",
    category: "dresses", priceCents: 650000, salePriceCents: null,
    description: "Placeholder demo product — replace with real Kiyomi catalog data via the admin panel.",
    materials: "Placeholder: 95% viscose, 5% elastane", careInstructions: "Placeholder: hand wash cold",
    isFeatured: true, isNewArrival: true, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
    variants: [{ size: "S", color: "Terracotta", qty: 8 }, { size: "M", color: "Terracotta", qty: 5 }, { size: "L", color: "Terracotta", qty: 0 }],
  },
  {
    name: "[DEMO] Amara linen set", slug: "demo-amara-linen-set", sku: "KYM-DEMO-002",
    category: "sets", priceCents: 890000, salePriceCents: 720000,
    description: "Placeholder demo product — replace with real Kiyomi catalog data via the admin panel.",
    materials: "Placeholder: 100% linen", careInstructions: "Placeholder: machine wash gentle",
    isFeatured: true, isBestseller: true, isNewArrival: false, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
    variants: [{ size: "S", color: "Sand", qty: 4 }, { size: "M", color: "Sand", qty: 6 }],
  },
  {
    name: "[DEMO] Zola tailored trousers", slug: "demo-zola-tailored-trousers", sku: "KYM-DEMO-003",
    category: "bottoms", priceCents: 520000, salePriceCents: null,
    description: "Placeholder demo product — replace with real Kiyomi catalog data via the admin panel.",
    materials: "Placeholder: cotton twill blend", careInstructions: "Placeholder: dry clean recommended",
    isFeatured: false, isBestseller: true, isNewArrival: false, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800",
    variants: [{ size: "S", color: "Ink", qty: 10 }, { size: "M", color: "Ink", qty: 7 }, { size: "L", color: "Ink", qty: 3 }],
  },
  {
    name: "[DEMO] Noa leather tote", slug: "demo-noa-leather-tote", sku: "KYM-DEMO-004",
    category: "bags", priceCents: 780000, salePriceCents: null,
    description: "Placeholder demo product — replace with real Kiyomi catalog data via the admin panel.",
    materials: "Placeholder: genuine leather", careInstructions: "Placeholder: wipe clean, condition regularly",
    isFeatured: true, isNewArrival: true, image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800",
    variants: [{ size: null, color: "Cognac", qty: 6 }],
  },
];

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@kiyomionline.com" },
    update: {},
    create: {
      email: "admin@kiyomionline.com",
      firstName: "Kiyomi", lastName: "Admin",
      passwordHash: await bcrypt.hash("ChangeMe123!", 12),
      role: "ADMIN", emailVerified: true,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      firstName: "Amina", lastName: "Otieno",
      passwordHash: await bcrypt.hash("ChangeMe123!", 12),
      role: "CUSTOMER", emailVerified: true,
    },
  });
  await prisma.wishlist.upsert({ where: { userId: customer.id }, update: {}, create: { userId: customer.id } });
  await prisma.wishlist.upsert({ where: { userId: admin.id }, update: {}, create: { userId: admin.id } });

  const categoryMap = {};
  for (const [i, c] of categories.entries()) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { name: c.name, slug: c.slug, sortOrder: i, isActive: true },
    });
    categoryMap[c.slug] = created.id;
  }

  for (const p of demoProducts) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name, slug: p.slug, sku: p.sku,
        description: p.description, materials: p.materials, careInstructions: p.careInstructions,
        categoryId: categoryMap[p.category],
        priceCents: p.priceCents, salePriceCents: p.salePriceCents,
        isFeatured: Boolean(p.isFeatured), isBestseller: Boolean(p.isBestseller), isNewArrival: Boolean(p.isNewArrival),
        isPublished: true,
        images: { create: [{ url: p.image, sortOrder: 0 }] },
      },
    });

    for (const v of p.variants) {
      // Not a plain upsert: Prisma/Postgres won't accept `null` inside a
      // compound unique filter (productId_size_color), which breaks for
      // sizeless products like bags. findFirst + create sidesteps that.
      let variant = await prisma.productVariant.findFirst({
        where: { productId: product.id, size: v.size, color: v.color },
      });
      if (!variant) {
        variant = await prisma.productVariant.create({
          data: { productId: product.id, size: v.size, color: v.color },
        });
      }
      await prisma.inventory.upsert({
        where: { variantId: variant.id },
        update: { quantity: v.qty },
        create: { variantId: variant.id, quantity: v.qty, lowStockThreshold: 5 },
      });
    }
  }

  await prisma.deliveryMethod.upsert({
    where: { id: "seed-standard" }, update: {},
    create: { id: "seed-standard", name: "Standard delivery", description: "3-5 business days", baseFeeCents: 30000, estimatedDaysMin: 3, estimatedDaysMax: 5 },
  });
  await prisma.deliveryMethod.upsert({
    where: { id: "seed-express" }, update: {},
    create: { id: "seed-express", name: "Express delivery", description: "1-2 business days", baseFeeCents: 60000, estimatedDaysMin: 1, estimatedDaysMax: 2 },
  });
  await prisma.deliveryMethod.upsert({
    where: { id: "seed-pickup" }, update: {},
    create: { id: "seed-pickup", name: "Pickup", description: "Collect from our Nairobi studio", baseFeeCents: 0, estimatedDaysMin: 1, estimatedDaysMax: 2 },
  });

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" }, update: {},
    create: { code: "WELCOME10", type: "PERCENTAGE", percentage: 10, minOrderAmountCents: 200000, usageLimit: 500, perCustomerLimit: 1, isActive: true },
  });

  await prisma.storeSettings.upsert({
    where: { id: "singleton" }, update: {},
    create: { id: "singleton", storeName: "Kiyomi Online Store", currency: "KES", returnPeriodDays: 7 },
  });

  console.log("Seed complete.");
  console.log("Admin login: admin@kiyomionline.com / ChangeMe123!");
  console.log("Customer login: customer@example.com / ChangeMe123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
