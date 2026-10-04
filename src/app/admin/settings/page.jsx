"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";

function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data.settings;
    },
  });

  useEffect(() => {
    if (data && !form) {
      setForm({
        storeName: data.storeName || "",
        logoUrl: data.logoUrl || "",
        contactEmail: data.contactEmail || "",
        contactPhone: data.contactPhone || "",
        whatsappNumber: data.whatsappNumber || "",
        currency: data.currency || "KES",
        freeShippingThresholdCents: data.freeShippingThresholdCents != null ? data.freeShippingThresholdCents / 100 : "",
        taxPercentage: data.taxPercentage ?? "",
        returnPeriodDays: data.returnPeriodDays ?? 7,
        announcement: data.announcement || "",
      });
    }
  }, [data, form]);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUri = await fileToDataUri(file);
    updateField("logoUrl", dataUri);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      freeShippingThresholdCents: form.freeShippingThresholdCents === "" ? null : Math.round(Number(form.freeShippingThresholdCents) * 100),
      taxPercentage: form.taxPercentage === "" ? null : Number(form.taxPercentage),
      returnPeriodDays: Number(form.returnPeriodDays),
      contactEmail: form.contactEmail || null,
      contactPhone: form.contactPhone || null,
      whatsappNumber: form.whatsappNumber || null,
      announcement: form.announcement || null,
    };

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSaving(false);

    if (!json.success) {
      push({ type: "error", message: json.error.message });
      return;
    }
    push({ type: "success", message: "Settings saved" });
    queryClient.setQueryData(["admin-settings"], json.data.settings);
  }

  if (isLoading || !form) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl">Settings</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
        <div>
          <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Store name</label>
          <input
            required
            value={form.storeName}
            onChange={(e) => updateField("storeName", e.target.value)}
            className="mt-1 w-full border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Logo</label>
          <div className="mt-2 flex items-center gap-4">
            {form.logoUrl && <img src={form.logoUrl} alt="Store logo" className="h-16 w-16 object-contain border border-kiyomi-sandDark" />}
            <label className="cursor-pointer border border-dashed border-kiyomi-sandDark px-4 py-2 text-xs text-kiyomi-muted">
              {form.logoUrl ? "Replace logo" : "Upload logo"}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Contact email</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => updateField("contactEmail", e.target.value)}
              className="mt-1 w-full border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Contact phone</label>
            <input
              value={form.contactPhone}
              onChange={(e) => updateField("contactPhone", e.target.value)}
              className="mt-1 w-full border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-kiyomi-muted">WhatsApp number</label>
          <input
            value={form.whatsappNumber}
            onChange={(e) => updateField("whatsappNumber", e.target.value)}
            className="mt-1 w-full border px-3 py-2 text-sm"
            placeholder="e.g. 254712345678"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Currency</label>
            <input
              value={form.currency}
              onChange={(e) => updateField("currency", e.target.value)}
              className="mt-1 w-full border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Free shipping over (KES)</label>
            <input
              type="number"
              step="0.01"
              value={form.freeShippingThresholdCents}
              onChange={(e) => updateField("freeShippingThresholdCents", e.target.value)}
              className="mt-1 w-full border px-3 py-2 text-sm"
              placeholder="e.g. 5000"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Tax (%)</label>
            <input
              type="number"
              value={form.taxPercentage}
              onChange={(e) => updateField("taxPercentage", e.target.value)}
              className="mt-1 w-full border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Return period (days)</label>
          <input
            type="number"
            required
            value={form.returnPeriodDays}
            onChange={(e) => updateField("returnPeriodDays", e.target.value)}
            className="mt-1 w-32 border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Announcement banner</label>
          <input
            value={form.announcement}
            onChange={(e) => updateField("announcement", e.target.value)}
            className="mt-1 w-full border px-3 py-2 text-sm"
            placeholder="e.g. Free delivery within Nairobi on orders over KES 5,000"
          />
        </div>

        <button type="submit" disabled={saving} className="bg-kiyomi-ink px-6 py-3 text-sm text-white disabled:opacity-50">
          {saving ? "Saving..." : "Save settings"}
        </button>
      </form>
    </div>
  );
}