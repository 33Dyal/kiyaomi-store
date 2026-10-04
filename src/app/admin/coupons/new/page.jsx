import { CouponForm } from "@/components/admin/coupon-form";

export default function NewCouponPage() {
  return (
    <div>
      <h1 className="text-2xl">New coupon</h1>
      <div className="mt-6">
        <CouponForm />
      </div>
    </div>
  );
}