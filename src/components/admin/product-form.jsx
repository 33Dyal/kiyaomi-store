"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { X, Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast";

function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProductForm({ initialProduct }) {
  const router = useRouter();
  const { push } = useToast();
  const isEdit = Boolean(initialProduct);

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      return json.data;
    },
  });

  const [form, setForm] = useState({
    name: initialProduct?.name || "",
    slug: initialProduct?.slug || "",
    sku: initialProduct?.sku || "",
    description: initialProduct?.description || "",
    materials: initialProduct?.materials || "",
    careInstructions: initialProduct?.careInstructions || "",
    categoryId: initialProduct?.categoryId || "",
    priceCents: initialProduct ? initialProduct.priceCents / 100 : "",
    salePriceCents: initialProduct?.salePriceCents ? initialProduct.salePriceCents / 100 : "",
    isFeatured: initialProduct?.isFeatured || false,
    isBestseller: initialProduct?.isBestseller || false,
    isNewArrival: initialProduct?.isNewArrival ?? true,
    isPublished: initialProduct?.isPublished || false,
  });
  const [images, setImages] = useState(initialProduct?.images.map((i) => i.url) || []);
  const [variants, setVariants] = useState(
    initialProduct?.variants.map((v) => ({
      id: v.id, size: v.size || "", color: v.color || "",
      priceCents: v.priceCents ? v.priceCents / 100 : "",
      quantity: v.inventory?.quantity ?? 0,
    })) || [{ size: "", color: "", priceCents: "", quantity: 0 }]
  );
  const [removedVariantIds, setRemovedVariantIds] = useState([]);
  const [saving, setSaving] = useState(false);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    const dataUris = await Promise.all(files.map(fileToDataUri));
    setImages((prev) => [...prev, ...dataUris]);
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariant(index, key, value) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [key]: value } : v)));
  }

  function addVariant() {
    setVariants((prev) => [...prev, { size: "", color: "", priceCents: "", quantity: 0 }]);
  }

  function removeVariant(index) {
    const v = variants[index];
    if (v.id) setRemovedVariantIds((prev) => [...prev, v.id]);
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      priceCents: Math.round(Number(form.priceCents) * 100),
      salePriceCents: form.salePriceCents ? Math.round(Number(form.salePriceCents) * 100) : null,
      images,
      variants: variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        size: v.size || null,
        color: v.color || null,
        priceCents: v.priceCents ? Math.round(Number(v.priceCents) * 100) : null,
        quantity: Number(v.quantity),
      })),
      ...(isEdit ? { removedVariantIds } : {}),
    };
    if (!isEdit) delete payload.slug; // slug required only at create; keep as-is for edit's schema (not editable here)

    const url = isEdit ? `/api/admin/products/${initialProduct.id}` : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSaving(false);

    if (!json.success) {
      push({ type: "error", message: json.error.message });
      return;
    }
    push({ type: "success", message: isEdit ? "Product updated" : "Product created" });
    router.push(isEdit ? `/admin/products/${initialProduct.id}` : `/admin/products/${json.data.product.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Name</label>
          <input required value={form.name} onChange={(e) => updateField("name", e.target.value)} className="mt-1 w-full border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-kiyomi-muted">SKU</label>
          <input required value={form.sku} onChange={(e) => updateField("sku", e.target.value)} className="mt-1 w-full border px-3 py-2 text-sm" />
        </div>
      </div>

      {!isEdit && (
        <div>
          <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Slug</label>
          <input required value={form.slug} onChange={(e) => updateField("slug", e.target.value)} className="mt-1 w-full border px-3 py-2 text-sm" placeholder="e.g. sienna-wrap-dress" />
        </div>
      )}

      <div>
        <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Category</label>
        <select required value={form.categoryId} onChange={(e) => updateField("categoryId", e.target.value)} className="mt-1 w-full border px-3 py-2 text-sm">
          <option value="">Select a category</option>
          {categoriesData?.categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Description</label>
        <textarea required rows={4} value={form.description} onChange={(e) => updateField("description", e.target.value)} className="mt-1 w-full border px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Materials</label>
          <input value={form.materials} onChange={(e) => updateField("materials", e.target.value)} className="mt-1 w-full border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Care instructions</label>
          <input value={form.careInstructions} onChange={(e) => updateField("careInstructions", e.target.value)} className="mt-1 w-full border px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Price (KES)</label>
          <input required type="number" step="0.01" value={form.priceCents} onChange={(e) => updateField("priceCents", e.target.value)} className="mt-1 w-full border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Sale price (KES, optional)</label>
          <input type="number" step="0.01" value={form.salePriceCents} onChange={(e) => updateField("salePriceCents", e.target.value)} className="mt-1 w-full border px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        {[
          ["isFeatured", "Featured"],
          ["isBestseller", "Bestseller"],
          ["isNewArrival", "New arrival"],
          ["isPublished", "Published (visible in shop)"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form[key]} onChange={(e) => updateField(key, e.target.checked)} />
            {label}
          </label>
        ))}
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Images</label>
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative h-24 w-24">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => removeImage(i)} className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer items-center justify-center border border-dashed border-kiyomi-sandDark text-xs text-kiyomi-muted">
            + Add
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-wide text-kiyomi-muted">Variants</label>
          <button type="button" onClick={addVariant} className="flex items-center gap-1 text-xs underline">
            <Plus className="h-3 w-3" /> Add variant
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2 border border-kiyomi-sandDark p-3">
              <input placeholder="Size" value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} className="w-20 border px-2 py-1 text-sm" />
              <input placeholder="Color" value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} className="w-28 border px-2 py-1 text-sm" />
              <input placeholder="Price override (KES)" type="number" step="0.01" value={v.priceCents} onChange={(e) => updateVariant(i, "priceCents", e.target.value)} className="w-36 border px-2 py-1 text-sm" />
              <input placeholder="Qty" type="number" value={v.quantity} onChange={(e) => updateVariant(i, "quantity", e.target.value)} className="w-20 border px-2 py-1 text-sm" />
              <button type="button" onClick={() => removeVariant(i)} className="ml-auto">
                <X className="h-4 w-4 text-kiyomi-muted" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" disabled={saving} className="bg-kiyomi-ink px-6 py-3 text-sm text-white disabled:opacity-50">
        {saving ? "Saving..." : isEdit ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}