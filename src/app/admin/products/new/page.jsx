import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl">New product</h1>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}