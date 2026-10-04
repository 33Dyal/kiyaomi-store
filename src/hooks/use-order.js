"use client";
import { useQuery } from "@tanstack/react-query";

export function useOrder(orderNumber) {
  return useQuery({
    queryKey: ["order", orderNumber],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderNumber}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
    enabled: Boolean(orderNumber),
    retry: false,
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
  });
}
