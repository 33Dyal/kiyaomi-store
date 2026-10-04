"use client";

import { useCurrentUser } from "@/hooks/use-checkout-data";

export default function AccountOverviewPage() {
  const { data, isLoading } = useCurrentUser();
  if (isLoading) return <p className="text-sm text-kiyomi-muted">Loading…</p>;
  const user = data?.user;
  return (
    <div className="space-y-2 text-sm">
      <p>Welcome back{user ? `, ${user.firstName}` : ""}.</p>
      <p className="text-kiyomi-muted">{user?.email}</p>
    </div>
  );
}
