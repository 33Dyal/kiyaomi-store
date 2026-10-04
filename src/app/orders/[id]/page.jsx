"use client";

import { use, useState } from "react";
import { useOrder } from "@/hooks/use-order";
import { useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@/lib/brand";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import Image from "next/image";

export default function OrderDetailPage({ params }) {
  const { orderNumber } = use(params);
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [reviewingItem, setReviewingItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useOrder(orderNumber);
  const order = data?.order;

  async function submitReview(item) {
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderItemId: item.id, productId: item.productId, rating, comment }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!json.success) {
      push({ type: "error", message: json.error.message });
      return;
    }
    push({ type: "success", message: "Review submitted — thanks!" });
    setReviewingItem(null);
    setRating(5);
    setComment("");
    queryClient.invalidateQueries({ queryKey: ["order", orderNumber] });
  }

  if (isLoading) return <div className="mx-auto max-w-content px-4 py-10">Loading...</div>;
  if (!order) return <div className="mx-auto max-w-content px-4 py-10">Order not found.</div>;

  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">{order.orderNumber}</h1>
        <Badge>{order.status.replace(/_/g, " ")}</Badge>
      </div>
      <p className="mt-1 text-sm text-kiyomi-muted">{new Date(order.createdAt).toLocaleDateString()}</p>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="divide-y divide-kiyomi-sandDark border border-kiyomi-sandDark">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4">
                <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden bg-kiyomi-sandDark">
                  {item.image && <Image src={item.image} alt={item.productName} fill className="object-cover" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p>{item.productName}</p>
                      {item.variantLabel && <p className="text-xs text-kiyomi-muted">{item.variantLabel}</p>}
                      <p className="text-xs text-kiyomi-muted">Qty {item.quantity}</p>
                    </div>
                    <span>{formatPrice(item.totalCents)}</span>
                  </div>

                  {item.alreadyReviewed && (
                    <p className="mt-2 text-xs text-green-700">You've reviewed this item — thank you!</p>
                  )}

                  {item.canReview && reviewingItem !== item.id && (
                    <button onClick={() => setReviewingItem(item.id)} className="mt-2 text-xs underline">
                      Leave a review
                    </button>
                  )}

                  {reviewingItem === item.id && (
                    <div className="mt-3 space-y-2 border-t border-kiyomi-sandDark pt-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} type="button" onClick={() => setRating(n)}>
                            <Star className={`h-5 w-5 ${n <= rating ? "fill-kiyomi-terracotta text-kiyomi-terracotta" : "text-kiyomi-sandDark"}`} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What did you think? (optional)"
                        className="w-full border px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => submitReview(item)}
                          disabled={submitting}
                          className="bg-kiyomi-ink px-4 py-2 text-xs text-white disabled:opacity-50"
                        >
                          {submitting ? "Submitting..." : "Submit review"}
                        </button>
                        <button onClick={() => setReviewingItem(null)} className="text-xs text-kiyomi-muted">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {order.address && (
            <div className="border border-kiyomi-sandDark bg-white p-4 text-sm">
              <h2 className="mb-2 font-medium">Delivery address</h2>
              <p>{order.address.fullName} — {order.address.phone}</p>
              <p>{order.address.street}, {order.address.area}, {order.address.city}, {order.address.county}</p>
            </div>
          )}
        </div>

        <div className="h-fit border border-kiyomi-sandDark bg-white p-4">
          <h2 className="mb-3 text-sm uppercase tracking-wide">Order summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotalCents)}</span></div>
            {order.discountCents > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>−{formatPrice(order.discountCents)}</span></div>}
            <div className="flex justify-between"><span>Delivery</span><span>{order.deliveryFeeCents ? formatPrice(order.deliveryFeeCents) : "—"}</span></div>
            <div className="flex justify-between border-t border-kiyomi-sandDark pt-2 font-medium"><span>Total</span><span>{formatPrice(order.totalCents)}</span></div>
          </div>
          {order.trackingNumber && (
            <p className="mt-4 text-xs text-kiyomi-muted">Tracking: {order.trackingNumber}</p>
          )}
        </div>
      </div>
    </div>
  );
}