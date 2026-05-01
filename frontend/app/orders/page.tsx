"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PackageCheck } from "lucide-react";
import { orderApi } from "@/lib/api/marketplace.api";
import { formatPrice } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { ProductImage } from "@/features/marketplace/components/ProductImage";

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const ordersQuery = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => orderApi.getMyOrders(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-black">Login to view orders</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">Your order history is linked with your account.</p>
        <Link href="/login?redirect=/orders" className="mt-6 inline-flex rounded-md bg-blue-700 px-5 py-3 text-sm font-black text-white">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">My Orders</p>
          <h1 className="mt-2 text-4xl font-black">Order history</h1>
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-4 py-8">
        {ordersQuery.isLoading && <p className="text-sm font-black text-slate-500">Loading orders...</p>}
        {ordersQuery.data?.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
            <PackageCheck className="mx-auto h-16 w-16 text-slate-300" />
            <h2 className="mt-4 text-2xl font-black">No orders yet</h2>
            <Link href="/components" className="mt-6 inline-flex rounded-md bg-blue-700 px-5 py-3 text-sm font-black text-white">
              Start Shopping
            </Link>
          </div>
        )}
        <div className="space-y-4">
          {ordersQuery.data?.map((order) => (
            <article key={order.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">Order ID</p>
                  <h2 className="mt-1 font-black">{order.id}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {new Date(order.createdAt).toLocaleString("en-IN")} / {order.status}
                  </p>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-2xl font-black text-blue-700">{formatPrice(order.totalAmountCents)}</p>
                  <Link href={`/orders/${order.id}`} className="mt-2 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-black">
                    View Details
                  </Link>
                </div>
              </div>
              <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
                {order.items.map((item) => (
                  <div key={item.id} className="w-48 shrink-0 rounded-md border border-slate-200 p-3">
                    <ProductImage src={item.component?.imageUrl} alt={item.description} className="aspect-square rounded-md" imageClassName="object-contain" />
                    <p className="mt-2 line-clamp-2 text-sm font-black">{item.description}</p>
                    <p className="text-xs font-bold text-slate-500">Qty {item.quantity}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
