"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { History } from "lucide-react";

export default function AdminInventoryPage() {
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [historyFor, setHistoryFor] = useState(null);
  const queryClient = useQueryClient();
  const { push } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-inventory", search, lowStockOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (lowStockOnly) params.set("lowStockOnly", "true");
      const res = await fetch(`/api/admin/inventory?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data;
    },
  });

  const { data: historyData } = useQuery({
    queryKey: ["admin-inventory-history", historyFor],
    queryFn: async () => {
      const res = await fetch(`/api/admin/inventory/${historyFor}`);
      const json = await res.json();
      return json.data.history;
    },
    enabled: Boolean(historyFor),
  });

  function startEdit(row) {
    setEditingId(row.variantId);
    setEditValue(String(row.quantity));
  }

  async function saveEdit(variantId) {
    const res = await fetch(`/api/admin/inventory/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: Number(editValue), reason: "manual-adjustment" }),
    });
    const json = await res.json();
    if (!json.success) {
      push({ type: "error", message: json.error.message });
      return;
    }
    push({ type: "success", message: "Stock updated" });
    setEditingId(null);
    queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
  }

  return (
    <div>
      <h1 className="text-2xl">Inventory</h1>

      <div className="mt-6 flex items-center gap-4">
        <input
          placeholder="Search by product or SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 whitespace-nowrap text-sm">
          <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
          Low stock only
        </label>
      </div>

      <div className="mt-6 border border-kiyomi-sandDark bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-kiyomi-sandDark text-left text-xs uppercase tracking-wide text-kiyomi-muted">
              <th className="p-3">Product</th>
              <th className="p-3">Variant</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Quantity</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-6 text-center text-kiyomi-muted">Loading...</td></tr>
            ) : data?.variants.length ? (
              data.variants.map((row) => {
                const low = row.quantity <= row.lowStockThreshold;
                return (
                  <tr key={row.variantId} className="border-b border-kiyomi-sandDark last:border-0">
                    <td className="p-3">
                      <Link href={`/admin/products?search=${encodeURIComponent(row.productSlug)}`} className="underline">
                        {row.productName}
                      </Link>
                    </td>
                    <td className="p-3">{row.variantLabel || "—"}</td>
                    <td className="p-3 text-xs text-kiyomi-muted">{row.sku}</td>
                    <td className="p-3">
                      {editingId === row.variantId ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20 border px-2 py-1 text-sm"
                            autoFocus
                          />
                          <button onClick={() => saveEdit(row.variantId)} className="text-xs underline">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-xs text-kiyomi-muted">Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(row)}
                          className={low ? "text-kiyomi-terracotta underline" : "underline"}
                        >
                          {row.quantity}
                        </button>
                      )}
                    </td>
                    <td className="p-3">
                      <button onClick={() => setHistoryFor(row.variantId)} title="View history">
                        <History className="h-4 w-4 text-kiyomi-muted" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={5} className="p-6 text-center text-kiyomi-muted">No variants found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {historyFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setHistoryFor(null)}>
          <div className="max-h-[70vh] w-full max-w-md overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg">Stock history</h2>
            {!historyData ? (
              <p className="text-sm text-kiyomi-muted">Loading...</p>
            ) : historyData.length === 0 ? (
              <p className="text-sm text-kiyomi-muted">No history yet.</p>
            ) : (
              <div className="space-y-2">
                {historyData.map((h) => (
                  <div key={h.id} className="flex justify-between border-b border-kiyomi-sandDark pb-2 text-sm">
                    <span>{h.reason}</span>
                    <span className={h.change < 0 ? "text-red-700" : "text-green-700"}>
                      {h.change > 0 ? "+" : ""}{h.change}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setHistoryFor(null)} className="mt-4 text-sm underline">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}