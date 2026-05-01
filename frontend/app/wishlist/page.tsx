"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/store/cartStore";
import { ProductImage } from "@/features/marketplace/components/ProductImage";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Wishlist</p>
          <h1 className="mt-2 text-4xl font-black">Saved products</h1>
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-4 py-8">
        {items.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
            <Heart className="mx-auto h-16 w-16 text-slate-300" />
            <h2 className="mt-4 text-2xl font-black">No saved products</h2>
            <Link href="/components" className="mt-6 inline-flex rounded-md bg-blue-700 px-5 py-3 text-sm font-black text-white">
              Browse Components
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 text-right">
              <button onClick={clearWishlist} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-black">Clear Wishlist</button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((component) => (
                <article key={component.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <ProductImage src={component.imageUrl} alt={component.name} className="aspect-square rounded-md" imageClassName="object-contain" />
                  <Link href={`/components/${component.id}`} className="mt-4 block line-clamp-2 min-h-12 font-black hover:text-blue-700">
                    {component.name}
                  </Link>
                  <p className="mt-2 text-xl font-black text-blue-700">{formatPrice(component.unitPriceCents)}</p>
                  <p className="mt-1 text-xs font-black text-emerald-700">Inc. GST</p>
                  <div className="mt-4 grid gap-2">
                    <button onClick={() => addItem(component, 1)} className="h-10 rounded-md bg-blue-700 text-sm font-black text-white">Add to Cart</button>
                    <button onClick={() => removeItem(component.id)} className="h-10 rounded-md border border-slate-300 text-sm font-black">Remove</button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
