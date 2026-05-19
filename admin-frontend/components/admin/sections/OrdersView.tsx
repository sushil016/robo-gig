"use client";

import type { AdminOrder, AdminOrderStatus } from "@/types";
import { compactType, priceLabel } from "@/utils";
import { orderStatuses } from "@/config/forms";

export function OrdersView({
  orders,
  isLoading,
  onUpdateStatus,
}: {
  orders: AdminOrder[];
  isLoading: boolean;
  onUpdateStatus: (order: AdminOrder, status: AdminOrderStatus) => void;
}) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmountCents, 0);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Orders</p>
          <p className="mt-2 text-3xl font-black text-blue-700">{orders.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Paid Orders</p>
          <p className="mt-2 text-3xl font-black text-blue-700">{orders.filter((order) => order.status === "PAID").length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Revenue</p>
          <p className="mt-2 text-3xl font-black text-blue-700">{priceLabel(totalRevenue)}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Order Management</p>
          <h2 className="mt-1 text-2xl font-black">All customer orders</h2>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-3">Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Shipping</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="py-4">
                    <p className="font-black">{order.id}</p>
                    <p className="text-xs font-semibold text-slate-500">{new Date(order.createdAt).toLocaleString("en-IN")} / {order.status}</p>
                  </td>
                  <td>
                    <p className="font-black">{order.user?.name || "Customer"}</p>
                    <p className="text-xs font-semibold text-slate-500">{order.user?.email}</p>
                  </td>
                  <td>
                    <div className="max-w-sm space-y-1">
                      {order.items.map((item) => (
                        <p key={item.id} className="truncate text-xs font-bold text-slate-600">
                          {item.quantity} x {item.description}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td>
                    <p className="font-bold">{order.payments[0]?.gateway || "TEST"}</p>
                    <p className="text-xs text-slate-500">{order.payments[0]?.status || "CREATED"}</p>
                  </td>
                  <td className="font-black text-blue-700">{priceLabel(order.totalAmountCents)}</td>
                  <td>
                    <p className="font-bold">{order.address?.city}, {order.address?.state}</p>
                    <p className="text-xs text-slate-500">{order.address?.phone}</p>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(event) => onUpdateStatus(order, event.target.value as AdminOrderStatus)}
                      disabled={isLoading || order.status === "CANCELLED" || order.status === "DELIVERED"}
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-xs font-black disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {compactType(status)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm font-black text-slate-500">
                    No orders found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
