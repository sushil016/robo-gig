"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { orderApi } from "@/lib/api/marketplace.api";
import { formatPrice } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { ProductImage } from "@/features/marketplace/components/ProductImage";
import { OrderStatus } from "@/lib/types/marketplace.types";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const orderQuery = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: isAuthenticated && Boolean(orderId),
  });
  const cancelMutation = useMutation({
    mutationFn: () => orderApi.cancelOrder(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      await queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success("Order cancelled");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to cancel order");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-black">Login to view this order</h1>
        <Link href={`/login?redirect=/orders/${orderId}`} className="mt-6 inline-flex rounded-md bg-blue-700 px-5 py-3 text-sm font-black text-white">
          Login
        </Link>
      </div>
    );
  }

  if (orderQuery.isLoading) {
    return <div className="px-4 py-20 text-center text-sm font-black text-slate-500">Loading order...</div>;
  }

  if (!orderQuery.data) {
    return <div className="px-4 py-20 text-center text-2xl font-black">Order not found</div>;
  }

  const order = orderQuery.data;
  const cancellableStatuses = [
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
  ];
  const canCancel = cancellableStatuses.includes(order.status);
  const canPay = order.status === OrderStatus.PENDING_PAYMENT;

  function handleCancelOrder() {
    if (!window.confirm("Cancel this order? Any reserved stock will be released.")) {
      return;
    }

    cancelMutation.mutate();
  }

  return (
    <div className="bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-[#F3F3E4]">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Link href="/orders" className="text-sm font-black text-blue-700">← Back to orders</Link>
          <h1 className="mt-3 text-4xl font-black">Order details</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">{order.id} / {order.status}</p>
        </div>
      </section>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-4">
          {order.items.map((item) => (
            <article key={item.id} className="grid gap-4 rounded-lg border border-slate-200 bg-[#F3F3E4] p-4 shadow-sm sm:grid-cols-[120px_minmax(0,1fr)_140px]">
              <ProductImage src={item.component?.imageUrl} alt={item.description} className="aspect-square rounded-md" imageClassName="object-contain" />
              <div>
                <h2 className="text-lg font-black">{item.description}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Qty {item.quantity}</p>
                {item.componentId && <Link href={`/components/${item.componentId}`} className="mt-3 inline-flex text-sm font-black text-blue-700">View product</Link>}
              </div>
              <p className="font-black text-blue-700">{formatPrice(item.subtotalCents)}</p>
            </article>
          ))}
        </section>
        <aside className="h-fit rounded-lg border border-slate-200 bg-[#F3F3E4] p-5 shadow-sm">
          <h2 className="text-xl font-black">Summary</h2>
          <div className="mt-4 space-y-3 text-sm font-semibold">
            <div className="flex justify-between"><span>Status</span><span>{order.status}</span></div>
            <div className="flex justify-between"><span>Payment</span><span>{order.payments[0]?.status || "CREATED"}</span></div>
            <div className="flex justify-between text-lg font-black"><span>Total</span><span className="text-blue-700">{formatPrice(order.totalAmountCents)}</span></div>
          </div>
          {order.address && (
            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="font-black">Shipping Address</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                {order.address.name}, {order.address.line1}, {order.address.line2 ? `${order.address.line2}, ` : ""}
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
            </div>
          )}
          <div className="mt-6 grid gap-3 border-t border-slate-200 pt-5">
            {canPay && (
              <Link
                href={`/checkout/payment/${order.id}`}
                className="flex h-11 items-center justify-center rounded-md bg-blue-700 text-sm font-black text-white"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Complete Payment
              </Link>
            )}
            {canCancel ? (
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelMutation.isPending}
                className="flex h-11 items-center justify-center rounded-md border border-red-200 text-sm font-black text-red-700 disabled:opacity-50"
              >
                <Ban className="mr-2 h-4 w-4" />
                {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
              </button>
            ) : (
              <p className="rounded-md bg-slate-50 p-3 text-sm font-bold text-slate-500">
                This order can no longer be cancelled from the storefront.
              </p>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
