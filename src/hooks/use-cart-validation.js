"use client";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/stores/cart-store";

export function useCartValidation() {
  const items = useCartStore((s) => s.items);
  const key = items.map((i) => `${i.productId}:${i.variantId}:${i.quantity}`).join("|");

  return useQuery({
    queryKey: ["cart-validation", key],
    queryFn: async () => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
    enabled: items.length > 0,
  });
}
