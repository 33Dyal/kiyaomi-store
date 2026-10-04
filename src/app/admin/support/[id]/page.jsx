"use client";

import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";

const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"];

export default function AdminTicketDetailPage({ params }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-ticket", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/support/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data.ticket;
    },
  });

  async function submitReply(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/admin/support/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) {
      push({ type: "error", message: json.error.message });
      return;
    }
    setReply("");
    push({ type: "success", message: "Reply sent" });
    queryClient.invalidateQueries({ queryKey: ["admin-ticket", id] });
  }

  async function updateStatus(status) {
    const res = await fetch(`/api/admin/support/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!json.success) {
      push({ type: "error", message: json.error.message });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["admin-ticket", id] });
    queryClient.invalidateQueries({ queryKey: ["admin-support"] });
  }

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Ticket not found.</div>;

  return (
    <div>
      <h1 className="text-2xl">{data.subject}</h1>
      <p className="text-sm text-kiyomi-muted">
        {data.customerName} — {data.customerEmail} {data.orderNumber && `— Order ${data.orderNumber}`}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="border border-kiyomi-sandDark bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-kiyomi-muted">Original message</p>
            <p className="mt-2 text-sm">{data.description}</p>
          </div>

          {data.messages.map((m) => (
            <div
              key={m.id}
              className={`border p-4 text-sm ${m.isStaff ? "border-kiyomi-ink bg-kiyomi-ink text-white" : "border-kiyomi-sandDark bg-white"}`}
            >
              <p className="text-xs opacity-70">{m.authorName} — {new Date(m.createdAt).toLocaleString()}</p>
              <p className="mt-1">{m.message}</p>
            </div>
          ))}

          <form onSubmit={submitReply} className="space-y-2">
            <textarea
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type a reply..."
              className="w-full border px-3 py-2 text-sm"
            />
            <button type="submit" disabled={saving} className="bg-kiyomi-ink px-4 py-2 text-sm text-white disabled:opacity-50">
              {saving ? "Sending..." : "Send reply"}
            </button>
          </form>
        </div>

        <div className="h-fit border border-kiyomi-sandDark bg-white p-4">
          <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Status</label>
          <select value={data.status} onChange={(e) => updateStatus(e.target.value)} className="mt-1 w-full border px-3 py-2 text-sm">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}