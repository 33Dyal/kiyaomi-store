"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchJson(url, init) {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Request failed");
  return json.data;
}

export function useServerWishlist(enabled = true) {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => fetchJson("/api/wishlist"),
    enabled,
    retry: false,
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId) => fetchJson(`/api/wishlist?productId=${productId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

export function useProductsByIds(ids) {
  return useQuery({
    queryKey: ["products-by-ids", ids.join(",")],
    queryFn: () => fetchJson(`/api/products?ids=${ids.join(",")}`),
    enabled: ids.length > 0,
  });
}
