"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, PackageCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/features/marketplace/components/ProductImage";
import { orderApi } from "@/lib/api/marketplace.api";
import { formatPrice } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { OrderStatus } from "@/lib/types/marketplace.types";

type PaymentClientProps = {
  orderId: string;
};

export function PaymentClient({ orderId }: PaymentClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  const orderQuery = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: isAuthenticated && Boolean(orderId),
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: () => orderApi.confirmPayment(orderId),
    onSuccess: async (order) => {
      await queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      await queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success("Payment confirmed");
      router.push(`/checkout/success?orderId=${order.id}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Payment confirmation failed");
    },
  });

  if (isAuthLoading) {
    return <div className="px-4 py-20 text-center text-sm font-black text-slate-500">Loading payment...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-black">Login to continue payment</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">This payment belongs to your RoboRoot account.</p>
        <Link
          href={`/login?redirect=/checkout/payment/${orderId}`}
          className="mt-6 inline-flex rounded-md bg-blue-700 px-5 py-3 text-sm font-black text-white"
        >
          Login
        </Link>
      </div>
    );
  }

  if (orderQuery.isLoading) {
    return <div className="px-4 py-20 text-center text-sm font-black text-slate-500">Loading order...</div>;
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-black">Order not found</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">Check your order history or start checkout again.</p>
        <Link href="/orders" className="mt-6 inline-flex rounded-md bg-blue-700 px-5 py-3 text-sm font-black text-white">
          My Orders
        </Link>
      </div>
    );
  }

  const order = orderQuery.data;
  const payment = order.payments[0];
  const isPending = order.status === OrderStatus.PENDING_PAYMENT;
  const isPaid = [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status);

  return (
    <div className="bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-[#F3F3E4]">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Secure Payment</p>
          <h1 className="mt-2 text-4xl font-black">Complete your order payment</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Order {order.id} / {order.status}
          </p>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-[#F3F3E4] p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-blue-700" />
              <div>
                <h2 className="text-2xl font-black">Payment method</h2>
                <p className="text-sm font-semibold text-slate-500">
                  {payment?.gateway || "TEST"} / {payment?.status || "CREATED"}
                </p>
              </div>
            </div>
            <div className="mt-5 rounded-md border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-bold leading-6 text-blue-950">
                Use this confirmation for manual UPI/bank/test collection while live gateway credentials are being connected. The backend verifies ownership, order state, payment state, and stock before marking the order paid.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-[#F3F3E4] p-5 shadow-sm">
            <h2 className="text-2xl font-black">Order items</h2>
            <div className="mt-5 space-y-3">
              {order.items.map((item) => (
                <article key={item.id} className="grid gap-4 rounded-md border border-slate-200 p-3 sm:grid-cols-[88px_minmax(0,1fr)_120px]">
                  <ProductImage
                    src={item.component?.imageUrl}
                    alt={item.description}
                    className="aspect-square rounded-md"
                    imageClassName="object-contain"
                  />
                  <div>
                    <p className="font-black">{item.description}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <p className="font-black text-blue-700">{formatPrice(item.subtotalCents)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-lg border border-slate-200 bg-[#F3F3E4] p-5 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-emerald-600" />
            <h2 className="text-xl font-black">Payment summary</h2>
          </div>
          <div className="mt-5 space-y-3 text-sm font-semibold">
            <div className="flex justify-between">
              <span>Payment status</span>
              <span>{payment?.status || "CREATED"}</span>
            </div>
            <div className="flex justify-between">
              <span>Order status</span>
              <span>{order.status}</span>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <div className="flex justify-between text-lg font-black">
                <span>Total</span>
                <span className="text-blue-700">{formatPrice(order.totalAmountCents)}</span>
              </div>
            </div>
          </div>

          {isPending && (
            <button
              type="button"
              onClick={() => confirmPaymentMutation.mutate()}
              disabled={confirmPaymentMutation.isPending}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-md bg-blue-700 text-sm font-black text-white disabled:bg-slate-300"
            >
              {confirmPaymentMutation.isPending ? "Confirming..." : "Confirm Payment"}
            </button>
          )}

          {isPaid && (
            <Link
              href={`/checkout/success?orderId=${order.id}`}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-md bg-emerald-600 text-sm font-black text-white"
            >
              <PackageCheck className="mr-2 h-4 w-4" />
              View Confirmation
            </Link>
          )}

          {order.status === OrderStatus.CANCELLED && (
            <p className="mt-6 rounded-md bg-red-50 p-4 text-sm font-bold text-red-700">
              This order has been cancelled. Create a new checkout to purchase these items.
            </p>
          )}

          <Link
            href={`/orders/${order.id}`}
            className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-slate-300 text-sm font-black"
          >
            View Order Detail
          </Link>
        </aside>
      </main>
    </div>
  );
}
