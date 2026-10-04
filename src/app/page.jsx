import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { brand } from "@/lib/brand";
import { serializeProductCard, productListInclude } from "@/lib/products/queries";
import { ProductGrid } from "@/components/products/product-grid";
import { ButtonLink } from "@/components/ui/button-link";
import { HeroCarousel } from "@/components/home/hero-carousel";

export const revalidate = 60;

async function getHomeData() {
  
  const [featured, newArrivals, bestsellers, categories] = await Promise.all([
    prisma.product.findMany({ where: { isPublished: true, deletedAt: null, isFeatured: true }, include: productListInclude, take: 4 }),
    prisma.product.findMany({ where: { isPublished: true, deletedAt: null, isNewArrival: true }, include: productListInclude, take: 4, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ where: { isPublished: true, deletedAt: null, isBestseller: true }, include: productListInclude, take: 4 }),
    prisma.category.findMany({ where: { isActive: true, parentId: null }, orderBy: { sortOrder: "asc" }, take: 6 }),
  ]);
  return {
    featured: featured.map(serializeProductCard),
    newArrivals: newArrivals.map(serializeProductCard),
    bestsellers: bestsellers.map(serializeProductCard),
    categories,
  };
}

export default async function HomePage() {
  const { featured, newArrivals, bestsellers, categories } = await getHomeData();

  return (
    <div>
   <HeroCarousel />

      {categories.length > 0 && (
        <section className="mx-auto max-w-content px-4 py-16">
          <h2 className="mb-6 text-xl">Shop by category</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            {categories.map((c) => (
              <Link key={c.slug} href={`/categories/${c.slug}`} className="border border-kiyomi-sandDark py-6 text-center text-sm hover:bg-kiyomi-sand">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-content px-4 py-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl">New arrivals</h2>
            <Link href="/shop?sort=newest" className="text-sm underline">View all</Link>
          </div>
          <ProductGrid products={newArrivals} />
        </section>
      )}

      {bestsellers.length > 0 && (
        <section className="mx-auto max-w-content bg-kiyomi-sand px-4 py-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl">Best sellers</h2>
            <Link href="/shop?sort=bestselling" className="text-sm underline">View all</Link>
          </div>
          <ProductGrid products={bestsellers} />
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto max-w-content px-4 py-16">
          <h2 className="mb-6 text-xl">Featured</h2>
          <ProductGrid products={featured} />
        </section>
      )}

      <section className="mx-auto max-w-content px-4 py-16 text-center">
        <h2 className="text-xl">Follow along</h2>
        <p className="mt-2 text-sm text-kiyomi-muted">Behind the scenes and new drops on Instagram.</p>
        <a href={brand.instagramUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block underline">
          {brand.instagramHandle}
        </a>
      </section>
    </div>
  );
}
