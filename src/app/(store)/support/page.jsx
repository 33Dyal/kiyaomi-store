"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const CATEGORIES = ["Order issue", "Product question", "Payment / billing", "Delivery", "Returns", "Other"];

export default function SupportPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: CATEGORIES[0], orderNumber: "", subject: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const { data } = useQuery({
    queryKey: ["my-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/support");
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
    enabled: Boolean(user),
  });

  async function submitTicket(e) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!json.success) {
      push({ type: "error", message: json.error.message });
      return;
    }
    push({ type: "success", message: "Ticket submitted" });
    setForm({ category: CATEGORIES[0], orderNumber: "", subject: "", description: "" });
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
  }

  if (userLoading) return <div className="mx-auto max-w-content px-4 py-10">Loading...</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-content px-4 py-24 text-center">
        <p className="text-sm text-kiyomi-muted">
          Please <Link href="/login?next=/support" className="underline">sign in</Link> to contact support or view your tickets.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Support</h1>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cancel" : "New ticket"}</Button>
      </div>

      {showForm && (
        <form onSubmit={submitTicket} className="mt-6 max-w-lg space-y-4 border border-kiyomi-sandDark p-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="mt-1 w-full border px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <Input
            label="Order number (optional)"
            value={form.orderNumber}
            onChange={(e) => setForm((f) => ({ ...f, orderNumber: e.target.value }))}
          />
          <Input
            label="Subject"
            required
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          />
          <div>
            <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full border px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit" loading={submitting}>Submit ticket</Button>
        </form>
      )}

      <div className="mt-8 space-y-2">
        {!data ? (
          <p className="text-sm text-kiyomi-muted">Loading tickets...</p>
        ) : data.tickets.length === 0 ? (
          <p className="text-sm text-kiyomi-muted">You haven't opened any support tickets yet.</p>
        ) : (
          data.tickets.map((t) => (
            <Link
              key={t.id}
              href={`/support/${t.id}`}
              className="flex items-center justify-between border border-kiyomi-sandDark p-4 text-sm hover:bg-kiyomi-sand"
            >
              <div>
                <p className="underline">{t.subject}</p>
                <p className="text-xs text-kiyomi-muted">{t.category}{t.orderNumber ? ` — Order ${t.orderNumber}` : ""}</p>
              </div>
              <span className="rounded bg-kiyomi-sand px-2 py-1 text-xs">{t.status.replace(/_/g, " ")}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}