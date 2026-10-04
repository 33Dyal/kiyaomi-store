"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useProducts, useCategories } from "@/hooks/use-products";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductGridSkeleton } from "@/components/ui/loading-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function CategoryPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(1);
  const { data: categoryData } = useCategories();
  const category = categoryData?.categories.find((c) => c.slug === slug);
  const { data, isLoading } = useProducts({ category: slug, page, pageSize: 12 });

  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories", href: "/categories" }, { label: category?.name || slug }]} />
      <h1 className="text-2xl">{category?.name || slug}</h1>
      <div className="mt-8">
        {isLoading ? (
          <ProductGridSkeleton />
        ) : (
          <>
            <ProductGrid products={data?.products || []} />
            <Pagination page={data?.pagination.page || 1} totalPages={data?.pagination.totalPages || 1} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
