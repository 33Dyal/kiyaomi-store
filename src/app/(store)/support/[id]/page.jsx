"use client";

import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function SupportTicketPage({ params }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["my-ticket", id],
    queryFn: async () => {
      const res = await fetch(`/api/support/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data.ticket;
    },
  });

  async function sendReply(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    const res = await fetch(`/api/support/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const json = await res.json();
    setSending(false);
    if (!json.success) {
      push({ type: "error", message: json.error.message });
      return;
    }
    setMessage("");
    queryClient.invalidateQueries({ queryKey: ["my-ticket", id] });
  }

  if (isLoading) return <div className="mx-auto max-w-content px-4 py-10">Loading...</div>;
  if (!data) return <div className="mx-auto max-w-content px-4 py-10">Ticket not found.</div>;

  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <h1 className="text-2xl">{data.subject}</h1>
      <p className="text-sm text-kiyomi-muted">
        {data.category}{data.orderNumber ? ` — Order ${data.orderNumber}` : ""} — {data.status.replace(/_/g, " ")}
      </p>

      <div className="mt-6 max-w-2xl space-y-4">
        <div className="border border-kiyomi-sandDark bg-white p-4 text-sm">
          <p className="text-xs uppercase tracking-wide text-kiyomi-muted">Your original message</p>
          <p className="mt-2">{data.description}</p>
          {data.imageUrl && <img src={data.imageUrl} alt="" className="mt-3 max-h-48" />}
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

        {data.status === "CLOSED" ? (
          <p className="text-sm text-kiyomi-muted">This ticket is closed. Open a new ticket if you need further help.</p>
        ) : (
          <form onSubmit={sendReply} className="space-y-2">
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a reply..."
              className="w-full border px-3 py-2 text-sm"
            />
            <Button type="submit" loading={sending}>Send reply</Button>
          </form>
        )}
      </div>
    </div>
  );
}