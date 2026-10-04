"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

function toLegacyCardShape(card) {
  return {
    id: card.id,
    slug: card.slug,
    name: card.name,
    priceCents: card.priceCents,
    salePriceCents: card.salePriceCents,
    currency: card.currency,
    rating: card.rating,
    reviewCount: card.reviewCount,
    images: [card.image, card.secondaryImage].filter(Boolean).map((url) => ({ url })),
    category: { name: card.category, slug: card.categorySlug },
    variants: [{ inStock: card.inStock }],
  };
}

export function useProducts({ category = "", sort = "newest", page = 1, pageSize = 12 } = {}) {
  const query = useQuery({
    queryKey: ["products", category, sort, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({ sort, page: String(page), pageSize: String(pageSize) });
      if (category) params.set("category", category);
      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
  });

  const data = query.data
    ? {
        products: query.data.products.map(toLegacyCardShape),
        pagination: query.data.pagination,
      }
    : null;

  return { data, isLoading: query.isLoading };
}

export function useCategories() {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
  });

  return { data: query.data ?? null, isLoading: query.isLoading };
}

export function useProduct(slug) {
  const query = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
    enabled: Boolean(slug),
  });

  return { data: query.data ?? null, isLoading: query.isLoading };
}

export function useSearch(query, { debounceMs = 300 } = {}) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const trimmed = debouncedQuery.trim();

  const result = useQuery({
    queryKey: ["search", trimmed],
    queryFn: async () => {
      const params = new URLSearchParams({ search: trimmed, pageSize: "24" });
      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
    enabled: trimmed.length > 0,
  });

  const data = result.data
    ? { products: result.data.products.map(toLegacyCardShape), pagination: result.data.pagination }
    : null;

  return { data, isLoading: result.isLoading };
}