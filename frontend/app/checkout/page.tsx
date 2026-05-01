"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { formatPrice, useCartStore } from "@/lib/store/cartStore";
import { orderApi } from "@/lib/api/marketplace.api";
import { PaymentGateway, type CouponValidationResponse } from "@/lib/types/marketplace.types";
import { ProductImage } from "@/features/marketplace/components/ProductImage";

const initialAddress = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [address, setAddress] = useState(initialAddress);
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>(PaymentGateway.TEST);
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = getSubtotal();
  const shipping = subtotal >= 50000 || subtotal === 0 ? 0 : 5000;
  const discount = appliedCoupon?.discountCents || 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const canCheckout = useMemo(() => {
    return (
      items.length > 0 &&
      address.name.trim() &&
      address.phone.trim() &&
      address.line1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.pincode.trim()
    );
  }, [address, items.length]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!canCheckout) {
      toast.error("Please fill shipping details");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = await orderApi.createOrder({
        items: items.map((item) => ({
          componentId: item.component.id,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        paymentGateway,
        couponCode: appliedCoupon?.code,
        notes: notes || undefined,
      });

      clearCart();
      if (payload.paymentUrl) {
        router.push(payload.paymentUrl);
        return;
      }

      toast.success("Order placed successfully");
      router.push(`/checkout/success?orderId=${payload.order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      toast.error("Enter a coupon code");
      return;
    }

    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const coupon = await orderApi.validateCoupon({
        code: couponCode,
        subtotalCents: subtotal,
        shippingCents: shipping,
      });

      setAppliedCoupon(coupon);
      toast.success(coupon ? `Coupon applied: ${coupon.label}` : "Coupon cleared");
    } catch (error) {
      setAppliedCoupon(null);
      toast.error(error instanceof Error ? error.message : "Coupon failed");
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  if (isLoading) {
    return <div className="px-4 py-20 text-center text-sm font-black text-slate-500">Loading checkout...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-black">Your cart is empty</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">Add products before checkout.</p>
        <Link href="/components" className="mt-6 inline-flex h-11 items-center rounded-md bg-blue-700 px-5 text-sm font-black text-white">
          Browse Components
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Checkout</p>
          <h1 className="mt-2 text-4xl font-black">Shipping and payment</h1>
          {!isAuthenticated && (
            <p className="mt-3 text-sm font-bold text-amber-700">
              You need to <Link href="/login?redirect=/checkout" className="underline">login</Link> before placing the order.
            </p>
          )}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_390px]">
        <main className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">Shipping address</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ["name", "Full name"],
                ["phone", "Phone number"],
                ["line1", "Address line 1"],
                ["line2", "Address line 2"],
                ["city", "City"],
                ["state", "State"],
                ["pincode", "Pincode"],
                ["country", "Country"],
              ].map(([key, label]) => (
                <input
                  key={key}
                  value={address[key as keyof typeof address]}
                  onChange={(event) => setAddress((prev) => ({ ...prev, [key]: event.target.value }))}
                  placeholder={label}
                  className="h-11 rounded-md border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-blue-600"
                  required={!["line2"].includes(key)}
                />
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Order notes, GST details, delivery instructions"
              className="mt-4 min-h-24 w-full rounded-md border border-slate-300 px-3 py-3 text-sm font-semibold outline-none focus:border-blue-600"
            />
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">Payment</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                [PaymentGateway.TEST, "Test Payment", "Instant paid order for development"],
                [PaymentGateway.PHONEPE, "PhonePe", "Gateway placeholder"],
                [PaymentGateway.STRIPE, "Card", "Gateway placeholder"],
              ].map(([value, title, copy]) => (
                <label
                  key={value}
                  className={`rounded-lg border p-4 ${
                    paymentGateway === value ? "border-blue-400 bg-blue-50" : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    value={value}
                    checked={paymentGateway === value}
                    onChange={() => setPaymentGateway(value as PaymentGateway)}
                    className="sr-only"
                  />
                  <CreditCard className="h-6 w-6 text-blue-700" />
                  <span className="mt-3 block font-black">{title}</span>
                  <span className="mt-1 block text-sm font-semibold text-slate-500">{copy}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">Coupon</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Try `ROBO10`, `STUDENT250`, or `FREESHIP` during development.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="h-11 flex-1 rounded-md border border-slate-300 px-3 text-sm font-black uppercase outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon}
                className="h-11 rounded-md bg-slate-950 px-5 text-sm font-black text-white disabled:bg-slate-300"
              >
                {isApplyingCoupon ? "Applying..." : "Apply"}
              </button>
              {appliedCoupon && (
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode("");
                  }}
                  className="h-11 rounded-md border border-slate-300 px-5 text-sm font-black"
                >
                  Remove
                </button>
              )}
            </div>
            {appliedCoupon && (
              <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                {appliedCoupon.label}: -{formatPrice(appliedCoupon.discountCents)}
              </p>
            )}
          </section>
        </main>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-xl font-black">Order Summary</h2>
          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div key={item.component.id} className="flex gap-3">
                <ProductImage src={item.component.imageUrl} alt={item.component.name} className="h-16 w-16 rounded-md" imageClassName="object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-black">{item.component.name}</p>
                  <p className="text-xs font-bold text-slate-500">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-black">{formatPrice(item.component.unitPriceCents * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm font-semibold">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Coupon {appliedCoupon?.code}</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black"><span>Total</span><span className="text-blue-700">{formatPrice(total)}</span></div>
          </div>
          <button
            disabled={isSubmitting || !canCheckout || !isAuthenticated}
            className="mt-6 h-12 w-full rounded-md bg-blue-700 text-sm font-black text-white disabled:bg-slate-300"
          >
            {isSubmitting ? "Placing order..." : "Place Order"}
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
            <ShieldCheck className="h-4 w-4" />
            Secure test checkout. Real gateway can plug into this flow.
          </p>
        </aside>
      </form>
    </div>
  );
}
