"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductForm } from "@/components/admin/product-form";
import { useToast } from "@/components/ui/toast";

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { push } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/products/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data.product;
    },
  });

  async function handleDelete() {
    if (!confirm("Delete this product? It will be unpublished and hidden, but not permanently removed.")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      push({ type: "error", message: json.error.message });
      return;
    }
    push({ type: "success", message: "Product deleted" });
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    router.push("/admin/products");
  }

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Product not found.</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Edit product</h1>
        <button onClick={handleDelete} className="text-sm text-red-700 underline">Delete product</button>
      </div>
      <div className="mt-6">
        <ProductForm initialProduct={data} />
      </div>
    </div>
  );
}