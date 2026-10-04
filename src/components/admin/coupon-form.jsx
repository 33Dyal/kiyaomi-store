"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { couponBaseSchema } from "@/schemas/coupon";

function centsToDollars(cents) {
  return cents == null ? "" : (cents / 100).toString();
}
function dollarsToCents(value) {
  if (value === "" || value == null) return null;
  return Math.round(parseFloat(value) * 100);
}
function toDatetimeLocal(iso) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

export function CouponForm({ coupon }) {
  const router = useRouter();
  const isEdit = Boolean(coupon);
  const [serverError, setServerError] = useState(null);
  const [productSearch, setProductSearch] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(couponBaseSchema),
    defaultValues: {
      code: coupon?.code ?? "",
      type: coupon?.type ?? "PERCENTAGE",
      percentage: coupon?.percentage ?? null,
      fixedAmountCents: coupon?.fixedAmountCents ?? null,
      minOrderAmountCents: coupon?.minOrderAmountCents ?? null,
      maxDiscountCents: coupon?.maxDiscountCents ?? null,
      expiresAt: coupon?.expiresAt ?? null,
      usageLimit: coupon?.usageLimit ?? null,
      perCustomerLimit: coupon?.perCustomerLimit ?? null,
      applicableCategoryIds: coupon?.applicableCategoryIds ?? [],
      applicableProductIds: coupon?.applicableProductIds ?? [],
      isActive: coupon?.isActive ?? true,
    },
  });

  const type = watch("type");
  const selectedCategoryIds = watch("applicableCategoryIds");
  const selectedProductIds = watch("applicableProductIds");

  const { data: categories } = useQuery({
    queryKey: ["admin-categories-lite"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data.categories ?? json.data;
    },
  });

  const { data: productResults } = useQuery({
    queryKey: ["admin-products-lite", productSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ pageSize: "20" });
      if (productSearch) params.set("search", productSearch);
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data.products;
    },
  });

  function toggleCategory(id) {
    const next = selectedCategoryIds.includes(id)
      ? selectedCategoryIds.filter((c) => c !== id)
      : [...selectedCategoryIds, id];
    setValue("applicableCategoryIds", next, { shouldDirty: true });
  }

  function toggleProduct(id) {
    const next = selectedProductIds.includes(id)
      ? selectedProductIds.filter((p) => p !== id)
      : [...selectedProductIds, id];
    setValue("applicableProductIds", next, { shouldDirty: true });
  }

  async function onSubmit(values) {
    setServerError(null);

    const payload = {
      ...values,
      percentage: values.type === "PERCENTAGE" ? Number(values.percentage) : null,
      fixedAmountCents:
        values.type === "FIXED_AMOUNT" ? dollarsToCents(values.fixedAmountCents) : null,
      minOrderAmountCents: dollarsToCents(values.minOrderAmountCents),
      maxDiscountCents: dollarsToCents(values.maxDiscountCents),
      expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
      usageLimit: values.usageLimit ? Number(values.usageLimit) : null,
      perCustomerLimit: values.perCustomerLimit ? Number(values.perCustomerLimit) : null,
    };

    const url = isEdit ? `/api/admin/coupons/${coupon.id}` : "/api/admin/coupons";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!json.success) {
      setServerError(json.error?.message ?? "Something went wrong");
      return;
    }

    router.push("/admin/coupons");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 max-w-xl space-y-5">
      {serverError && (
        <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{serverError}</div>
      )}

      <div>
        <label className="block text-sm text-kiyomi-muted">Code</label>
        <input
          {...register("code")}
          placeholder="SUMMER20"
          className="mt-1 w-full border px-3 py-2 text-sm uppercase"
        />
        {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
      </div>

      <div>
        <label className="block text-sm text-kiyomi-muted">Discount type</label>
        <select {...register("type")} className="mt-1 w-full border bg-white px-3 py-2 text-sm">
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED_AMOUNT">Fixed amount</option>
        </select>
      </div>

      {type === "PERCENTAGE" ? (
        <div>
          <label className="block text-sm text-kiyomi-muted">Percentage off</label>
          <input
            type="number"
            {...register("percentage")}
            placeholder="20"
            className="mt-1 w-full border px-3 py-2 text-sm"
          />
          {errors.percentage && (
            <p className="mt-1 text-xs text-red-600">{errors.percentage.message}</p>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm text-kiyomi-muted">Fixed amount ($)</label>
          <input
            type="number"
            step="0.01"
            defaultValue={centsToDollars(coupon?.fixedAmountCents)}
            {...register("fixedAmountCents")}
            placeholder="10.00"
            className="mt-1 w-full border px-3 py-2 text-sm"
          />
          {errors.fixedAmountCents && (
            <p className="mt-1 text-xs text-red-600">{errors.fixedAmountCents.message}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-kiyomi-muted">Min order amount ($)</label>
          <input
            type="number"
            step="0.01"
            defaultValue={centsToDollars(coupon?.minOrderAmountCents)}
            {...register("minOrderAmountCents")}
            className="mt-1 w-full border px-3 py-2 text-sm"
          />
        </div>
        {type === "PERCENTAGE" && (
          <div>
            <label className="block text-sm text-kiyomi-muted">Max discount cap ($)</label>
            <input
              type="number"
              step="0.01"
              defaultValue={centsToDollars(coupon?.maxDiscountCents)}
              {...register("maxDiscountCents")}
              className="mt-1 w-full border px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-kiyomi-muted">Total usage limit</label>
          <input
            type="number"
            {...register("usageLimit")}
            placeholder="Unlimited"
            className="mt-1 w-full border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-kiyomi-muted">Limit per customer</label>
          <input
            type="number"
            {...register("perCustomerLimit")}
            placeholder="Unlimited"
            className="mt-1 w-full border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-kiyomi-muted">Expires at</label>
        <input
          type="datetime-local"
          defaultValue={toDatetimeLocal(coupon?.expiresAt)}
          {...register("expiresAt")}
          className="mt-1 w-full border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-kiyomi-muted">
          Applicable categories <span className="text-xs">(leave empty for all)</span>
        </label>
        <div className="mt-1 max-h-40 overflow-y-auto border p-2">
          {categories?.length ? (
            categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 py-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="h-4 w-4"
                />
                {cat.name}
              </label>
            ))
          ) : (
            <p className="text-xs text-kiyomi-muted">No categories found.</p>
          )}
        </div>
        {selectedCategoryIds.length > 0 && (
          <p className="mt-1 text-xs text-kiyomi-muted">{selectedCategoryIds.length} selected</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-kiyomi-muted">
          Applicable products <span className="text-xs">(leave empty for all)</span>
        </label>
        <input
          placeholder="Search products to add..."
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          className="mt-1 w-full border px-3 py-2 text-sm"
        />
        <div className="mt-2 max-h-40 overflow-y-auto border p-2">
          {productResults?.length ? (
            productResults.map((p) => (
              <label key={p.id} className="flex items-center gap-2 py-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedProductIds.includes(p.id)}
                  onChange={() => toggleProduct(p.id)}
                  className="h-4 w-4"
                />
                {p.name} <span className="text-xs text-kiyomi-muted">({p.sku})</span>
              </label>
            ))
          ) : (
            <p className="text-xs text-kiyomi-muted">No products found.</p>
          )}
        </div>
        {selectedProductIds.length > 0 && (
          <p className="mt-1 text-xs text-kiyomi-muted">{selectedProductIds.length} selected</p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isActive")} className="h-4 w-4" />
        Active
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-kiyomi-ink px-5 py-2 text-sm text-white disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create coupon"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/coupons")}
          className="border px-5 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}