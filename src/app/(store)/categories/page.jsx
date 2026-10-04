"use client";

import Link from "next/link";
import { useCategories } from "@/hooks/use-products";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductGridSkeleton } from "@/components/ui/loading-skeleton";

export default function CategoriesPage() {
  const { data, isLoading } = useCategories();
  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />
      <h1 className="text-2xl">Shop by category</h1>
      {isLoading ? (
        <div className="mt-8"><ProductGridSkeleton /></div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {data?.categories.map((c) => (
            <Link key={c.slug} href={`/categories/${c.slug}`} className="border border-kiyomi-sandDark p-6 text-center hover:bg-kiyomi-sand">
              <p className="text-sm">{c.name}</p>
              <p className="mt-1 text-xs text-kiyomi-muted">{c.productCount} items</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
