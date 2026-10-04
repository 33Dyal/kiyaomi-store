"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminReviewsPage() {
  const [status, setStatus] = useState("PENDING");
  const queryClient = useQueryClient();
  const { push } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", status],
    queryFn: async () => {
      const res = await fetch(`/api/admin/reviews?status=${status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data.reviews;
    },
  });

  async function moderate(id, newStatus) {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const json = await res.json();
    if (!json.success) {
      push({ type: "error", message: json.error.message });
      return;
    }
    push({ type: "success", message: `Review ${newStatus.toLowerCase()}` });
    queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
  }

  return (
    <div>
      <h1 className="text-2xl">Reviews</h1>

      <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-6 border px-3 py-2 text-sm">
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="HIDDEN">Hidden</option>
      </select>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-sm text-kiyomi-muted">Loading...</p>
        ) : data?.length === 0 ? (
          <p className="text-sm text-kiyomi-muted">No {status.toLowerCase()} reviews.</p>
        ) : (
          data.map((r) => (
            <div key={r.id} className="border border-kiyomi-sandDark bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Link href={`/products/${r.productSlug}`} className="underline">{r.productName}</Link>
                  <p className="text-xs text-kiyomi-muted">{r.customerName} — {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "fill-kiyomi-terracotta text-kiyomi-terracotta" : "text-kiyomi-sandDark"}`} />
                  ))}
                </div>
              </div>
              {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
              {status === "PENDING" && (
                <div className="mt-3 flex gap-3">
                  <button onClick={() => moderate(r.id, "APPROVED")} className="text-xs text-green-700 underline">Approve</button>
                  <button onClick={() => moderate(r.id, "HIDDEN")} className="text-xs text-red-700 underline">Reject</button>
                </div>
              )}
              {status === "APPROVED" && (
                <button onClick={() => moderate(r.id, "HIDDEN")} className="mt-3 text-xs text-red-700 underline">Hide</button>
              )}
              {status === "HIDDEN" && (
                <button onClick={() => moderate(r.id, "APPROVED")} className="mt-3 text-xs text-green-700 underline">Restore</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}