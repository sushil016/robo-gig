"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, useCartStore } from "@/lib/store/cartStore";
import { ProductImage } from "@/features/marketplace/components/ProductImage";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal >= 50000 || subtotal === 0 ? 0 : 5000;
  const total = subtotal + shipping;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  function handleRemove(componentId: string, name: string) {
    removeItem(componentId);
    toast.success("Removed from cart", { description: name });
  }

  return (
    <div className="bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Shopping Cart</p>
          <h1 className="mt-2 text-4xl font-black">Review your order</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {items.length === 0 ? "Your cart is empty" : `${totalItems} item${totalItems === 1 ? "" : "s"} ready for checkout`}
          </p>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {items.length === 0 ? (
          <section className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-20 w-20 text-slate-300" />
            <h2 className="mt-5 text-2xl font-black">Your cart is empty</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Browse components and add items to start checkout.</p>
            <Link href="/components" className="mt-6 inline-flex h-11 items-center rounded-md bg-blue-700 px-5 text-sm font-black text-white">
              Browse Components
            </Link>
          </section>
        ) : (
          <>
            <section className="space-y-4">
              {items.map((item) => (
                <article key={item.component.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)_180px]">
                    <ProductImage
                      src={item.component.imageUrl}
                      alt={item.component.name}
                      className="aspect-square rounded-md"
                      imageClassName="object-contain"
                    />
                    <div className="min-w-0">
                      <Link href={`/components/${item.component.id}`} className="text-lg font-black hover:text-blue-700">
                        {item.component.name}
                      </Link>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {item.component.category} / {item.component.subcategory}
                      </p>
                      {item.component.sku && <p className="mt-1 text-xs font-bold text-slate-400">SKU: {item.component.sku}</p>}
                      <p className="mt-3 text-xl font-black text-blue-700">{formatPrice(item.component.unitPriceCents)}</p>
                      {item.component.stockQuantity < item.quantity && (
                        <p className="mt-2 text-sm font-bold text-red-600">Only {item.component.stockQuantity} left in stock</p>
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-4 sm:items-end">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.component.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-10 w-10 rounded-md border border-slate-300 disabled:opacity-40"
                        >
                          <Minus className="mx-auto h-4 w-4" />
                        </button>
                        <input
                          value={item.quantity}
                          onChange={(event) => updateQuantity(item.component.id, Number(event.target.value) || 1)}
                          className="h-10 w-16 rounded-md border border-slate-300 text-center text-sm font-black"
                          type="number"
                          min="1"
                          max={item.component.stockQuantity}
                        />
                        <button
                          onClick={() => updateQuantity(item.component.id, item.quantity + 1)}
                          disabled={item.quantity >= item.component.stockQuantity}
                          className="h-10 w-10 rounded-md border border-slate-300 disabled:opacity-40"
                        >
                          <Plus className="mx-auto h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-black">{formatPrice(item.component.unitPriceCents * item.quantity)}</p>
                      <button
                        onClick={() => handleRemove(item.component.id, item.component.name)}
                        className="inline-flex items-center text-sm font-black text-red-600"
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              <button onClick={() => clearCart()} className="h-11 w-full rounded-md border border-slate-300 bg-white text-sm font-black">
                Clear Cart
              </button>
            </section>

            <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-xl font-black">Order Summary</h2>
              <div className="mt-5 space-y-3 text-sm font-semibold">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-lg font-black">
                    <span>Total</span>
                    <span className="text-blue-700">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => router.push("/checkout")} className="mt-6 h-12 w-full rounded-md bg-blue-700 text-sm font-black text-white">
                Proceed to Checkout
              </button>
              <Link href="/components" className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-md border border-slate-300 text-sm font-black">
                Continue Shopping
              </Link>
            </aside>
          </>
        )}
      </main>
    </div>
  );
}
