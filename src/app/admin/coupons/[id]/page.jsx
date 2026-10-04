"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { CouponForm } from "@/components/admin/coupon-form";

export default function EditCouponPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-coupon", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/coupons/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data.coupon;
    },
  });

  if (isLoading) return <p className="text-kiyomi-muted">Loading...</p>;
  if (!data) return <p className="text-kiyomi-muted">Coupon not found.</p>;

  return (
    <div>
      <h1 className="text-2xl">Edit coupon — {data.code}</h1>
      <div className="mt-6">
        <CouponForm coupon={data} />
      </div>

      <div className="mt-10">
        <h2 className="text-lg">Recent redemptions</h2>
        <div className="mt-3 border border-kiyomi-sandDark bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-kiyomi-sandDark text-left text-xs uppercase tracking-wide text-kiyomi-muted">
                <th className="p-3">Order</th>
                <th className="p-3">User</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.usages?.length ? (
                data.usages.map((u) => (
                  <tr key={u.id} className="border-b border-kiyomi-sandDark last:border-0">
                    <td className="p-3">{u.orderId}</td>
                    <td className="p-3">{u.userId}</td>
                    <td className="p-3">{new Date(u.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="p-6 text-center text-kiyomi-muted">No redemptions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}