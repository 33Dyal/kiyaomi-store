"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema } from "@/schemas/checkout";
import { useCartStore } from "@/stores/cart-store";
import { useAddresses, useDeliveryMethods, useCurrentUser } from "@/hooks/use-checkout-data";
import { CheckoutStepper } from "@/components/checkout/checkout-stepper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/brand";
import Image from "next/image";

const STEPS = ["Contact", "Address", "Delivery", "Review", "Payment"];

export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState(null);
  const [deliveryMethodId, setDeliveryMethodId] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [phone, setPhone] = useState("");
  const [mpesaStatus, setMpesaStatus] = useState(null); // null | "waiting" | "failed"

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotalCents());
  const { push } = useToast();

  const { data: userData } = useCurrentUser();
  const { data: addressData } = useAddresses();
  const { data: deliveryData } = useDeliveryMethods();

  const selectedDeliveryMethod = deliveryData?.methods.find((m) => m.id === deliveryMethodId);
  const deliveryFeeCents = selectedDeliveryMethod?.baseFeeCents ?? 0;
  const discountCents = appliedDiscount?.discountCents ?? 0;
  const totalCents = subtotal - discountCents + deliveryFeeCents;

  async function applyCoupon() {
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotalCents: subtotal }),
    });
    const json = await res.json();
    if (!json.success) {
      push({ type: "error", message: json.error.message });
      setAppliedDiscount(null);
      return;
    }
    setAppliedDiscount(json.data);
    push({ type: "success", message: "Coupon applied" });
  }

  async function placeOrder() {
    setPlacingOrder(true);
    try {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
          addressId: selectedAddressId || undefined,
          newAddress: selectedAddressId ? undefined : newAddress,
          deliveryMethodId,
          couponCode: appliedDiscount ? couponCode : undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        push({ type: "error", message: json.error.message });
        setPlacingOrder(false);
        return;
      }
      window.location.href = json.data.checkoutUrl; // hand off to Stripe-hosted payment page
    } catch {
      push({ type: "error", message: "Something went wrong. Please try again." });
      setPlacingOrder(false);
    }
  }

  async function placeOrderMpesa() {
    setPlacingOrder(true);
    setMpesaStatus("waiting");
    try {
      const res = await fetch("/api/payments/mpesa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
          addressId: selectedAddressId || undefined,
          newAddress: selectedAddressId ? undefined : newAddress,
          deliveryMethodId,
          couponCode: appliedDiscount ? couponCode : undefined,
          phone,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        push({ type: "error", message: json.error.message });
        setPlacingOrder(false);
        setMpesaStatus(null);
        return;
      }

      const { checkoutRequestId, orderNumber } = json.data;
      const poll = setInterval(async () => {
        const statusRes = await fetch(`/api/payments/mpesa/status?checkoutRequestId=${checkoutRequestId}`);
        const statusJson = await statusRes.json();
        if (!statusJson.success) return;

        if (statusJson.data.paymentStatus === "PAID") {
          clearInterval(poll);
          window.location.href = `/checkout/success?order=${orderNumber}`;
        } else if (statusJson.data.paymentStatus === "FAILED") {
          clearInterval(poll);
          setMpesaStatus("failed");
          setPlacingOrder(false);
        }
      }, 3000);

      // stop polling after 90s in case the customer never responds to the prompt
      setTimeout(() => clearInterval(poll), 90000);
    } catch {
      push({ type: "error", message: "Something went wrong. Please try again." });
      setPlacingOrder(false);
      setMpesaStatus(null);
    }
  }

  if (items.length === 0) {
    return <div className="mx-auto max-w-content px-4 py-24 text-center">Your bag is empty.</div>;
  }

  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <div className="mb-10">
        <CheckoutStepper steps={STEPS} current={step} />
      </div>

      <div className="grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          {step === 0 && (
            <ContactStep
              defaultValues={userData?.user}
              onNext={(values) => { setContact(values); setStep(1); }}
            />
          )}
          {step === 1 && (
            <AddressStep
              addresses={addressData?.addresses || []}
              onBack={() => setStep(0)}
              onNext={(addressId, address) => {
                setSelectedAddressId(addressId);
                setNewAddress(address);
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <DeliveryStep
              methods={deliveryData?.methods || []}
              selected={deliveryMethodId}
              onBack={() => setStep(1)}
              onNext={(id) => { setDeliveryMethodId(id); setStep(3); }}
            />
          )}
          {step === 3 && (
            <ReviewStep
              items={items}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              onApplyCoupon={applyCoupon}
              appliedDiscount={appliedDiscount}
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg">Payment</h2>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex-1 border px-4 py-3 text-sm ${paymentMethod === "card" ? "border-kiyomi-terracotta bg-kiyomi-terracotta text-white" : "border-kiyomi-sandDark"}`}
                >
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mpesa")}
                  className={`flex-1 border px-4 py-3 text-sm ${paymentMethod === "mpesa" ? "border-kiyomi-terracotta bg-kiyomi-terracotta text-white" : "border-kiyomi-sandDark"}`}
                >
                  M-Pesa
                </button>
              </div>

              {paymentMethod === "card" && (
                <>
                  <p className="text-sm text-kiyomi-muted">
                    You'll be redirected to Stripe's secure checkout to complete payment by card. Kiyomi never sees or stores your card details.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setStep(3)}>Back</Button>
                    <Button onClick={placeOrder} loading={placingOrder}>Pay {formatPrice(totalCents)}</Button>
                  </div>
                </>
              )}

              {paymentMethod === "mpesa" && (
                <>
                  {mpesaStatus === "waiting" ? (
                    <div className="space-y-2 border border-kiyomi-sandDark p-4 text-sm">
                      <p>Check your phone — enter your M-Pesa PIN to complete payment.</p>
                      <p className="text-xs text-kiyomi-muted">This page will update automatically once payment is confirmed.</p>
                    </div>
                  ) : (
                    <>
                      <Input
                        label="M-Pesa phone number"
                        placeholder="07XX XXX XXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      {mpesaStatus === "failed" && (
                        <p className="text-sm text-red-700">Payment wasn't completed. Please try again.</p>
                      )}
                      <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setStep(3)}>Back</Button>
                        <Button onClick={placeOrderMpesa} loading={placingOrder} disabled={!phone}>
                          Pay {formatPrice(totalCents)} with M-Pesa
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <OrderSummary items={items} subtotal={subtotal} deliveryFeeCents={deliveryFeeCents} discountCents={discountCents} totalCents={totalCents} />
      </div>
    </div>
  );
}

function ContactStep({ defaultValues, onNext }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: defaultValues ? `${defaultValues.firstName} ${defaultValues.lastName}` : "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
    },
  });
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <h2 className="text-lg">Contact information</h2>
      <Input label="Full name" error={errors.fullName?.message} {...register("fullName", { required: true })} />
      <Input label="Email" type="email" error={errors.email?.message} {...register("email", { required: true })} />
      <Input label="Phone number" error={errors.phone?.message} {...register("phone", { required: true })} />
      <Button type="submit">Continue to address</Button>
    </form>
  );
}

function AddressStep({ addresses, onBack, onNext }) {
  const [useNew, setUseNew] = useState(addresses.length === 0);
  const [selected, setSelected] = useState(addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || null);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(addressSchema) });

  if (!useNew) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg">Delivery address</h2>
        <div className="space-y-2">
          {addresses.map((a) => (
            <label key={a.id} className="flex cursor-pointer items-start gap-3 border border-kiyomi-sandDark p-4 text-sm">
              <input type="radio" name="address" checked={selected === a.id} onChange={() => setSelected(a.id)} className="mt-1" />
              <span>
                {a.fullName} — {a.street}, {a.area}, {a.city}, {a.county}
              </span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack}>Back</Button>
          <Button variant="ghost" onClick={() => setUseNew(true)}>+ Add new address</Button>
          <Button onClick={() => onNext(selected, null)} disabled={!selected}>Continue</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((values) => onNext(null, values))} className="space-y-4">
      <h2 className="text-lg">Delivery address</h2>
      <Input label="Full name" error={errors.fullName?.message} {...register("fullName")} />
      <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="County" error={errors.county?.message} {...register("county")} />
        <Input label="City" error={errors.city?.message} {...register("city")} />
      </div>
      <Input label="Area" error={errors.area?.message} {...register("area")} />
      <Input label="Street / building" error={errors.street?.message} {...register("street")} />
      <Input label="Apartment / house number (optional)" {...register("apartment")} />
      <Input label="Delivery instructions (optional)" {...register("instructions")} />
      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={addresses.length ? () => setUseNew(false) : onBack}>Back</Button>
        <Button type="submit">Continue to delivery</Button>
      </div>
    </form>
  );
}

function DeliveryStep({ methods, selected, onBack, onNext }) {
  const [choice, setChoice] = useState(selected);
  return (
    <div className="space-y-4">
      <h2 className="text-lg">Delivery method</h2>
      <div className="space-y-2">
        {methods.map((m) => (
          <label key={m.id} className="flex cursor-pointer items-center justify-between border border-kiyomi-sandDark p-4 text-sm">
            <span className="flex items-center gap-3">
              <input type="radio" name="delivery" checked={choice === m.id} onChange={() => setChoice(m.id)} />
              <span>
                {m.name} <span className="block text-xs text-kiyomi-muted">{m.description}</span>
              </span>
            </span>
            <span>{formatPrice(m.baseFeeCents)}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button onClick={() => onNext(choice)} disabled={!choice}>Continue to review</Button>
      </div>
    </div>
  );
}

function ReviewStep({ items, couponCode, setCouponCode, onApplyCoupon, appliedDiscount, onBack, onNext }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg">Review your order</h2>
      <div className="divide-y divide-kiyomi-sandDark border border-kiyomi-sandDark">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId}`} className="flex items-center gap-3 p-3">
            <div className="relative h-14 w-12 flex-shrink-0 overflow-hidden bg-kiyomi-sandDark">
              {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
            </div>
            <div className="flex-1 text-sm">
              <p>{item.name}</p>
              <p className="text-xs text-kiyomi-muted">
                {[item.size, item.color].filter(Boolean).join(" / ")} × {item.quantity}
              </p>
            </div>
            <span className="text-sm">{formatPrice(item.unitPriceCents * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-1" />
        <Button type="button" variant="secondary" onClick={onApplyCoupon}>Apply</Button>
      </div>
      {appliedDiscount && <p className="text-xs text-green-700">Coupon applied: −{formatPrice(appliedDiscount.discountCents)}</p>}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Continue to payment</Button>
      </div>
    </div>
  );
}

function OrderSummary({ items, subtotal, deliveryFeeCents, discountCents, totalCents }) {
  return (
    <div className="h-fit border border-kiyomi-sandDark p-6">
      <h2 className="text-sm uppercase tracking-wide">Order summary ({items.length} items)</h2>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        {discountCents > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>−{formatPrice(discountCents)}</span></div>}
        <div className="flex justify-between"><span>Delivery</span><span>{deliveryFeeCents ? formatPrice(deliveryFeeCents) : "—"}</span></div>
        <div className="flex justify-between border-t border-kiyomi-sandDark pt-2 font-medium"><span>Total</span><span>{formatPrice(totalCents)}</span></div>
      </div>
    </div>
  );
}