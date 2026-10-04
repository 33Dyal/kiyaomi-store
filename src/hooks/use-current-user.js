"use client";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) return null;
      const json = await res.json();
      return json.success ? json.data.user : null;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}