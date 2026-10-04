"use client";
import { useQuery } from "@tanstack/react-query";

async function fetchJson(url) {
  const res = await fetch(url);
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message);
  return json.data;
}

export function useAddresses(enabled = true) {
  return useQuery({ queryKey: ["addresses"], queryFn: () => fetchJson("/api/addresses"), enabled });
}

export function useDeliveryMethods() {
  return useQuery({ queryKey: ["delivery-methods"], queryFn: () => fetchJson("/api/delivery") });
}

export function useCurrentUser() {
  return useQuery({ queryKey: ["me"], queryFn: () => fetchJson("/api/auth/me"), retry: false });
}
