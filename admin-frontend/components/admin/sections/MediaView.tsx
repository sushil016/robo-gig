"use client";

/* eslint-disable @next/next/no-img-element */

import type { Product } from "@/types";
import { productImage } from "@/utils";

export function MediaView({ products, onEditProduct }: { products: Product[]; onEditProduct: (product: Product) => void }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Images & Media</p>
          <h2 className="mt-1 text-2xl font-black">Product image library</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">Click any item to update image URL, vendor link, tags, and homepage flags.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
        {products.map((product) => (
          <button key={product.id} onClick={() => onEditProduct(product)} className="overflow-hidden rounded-lg border border-slate-200 bg-white text-left transition hover:border-blue-300 hover:shadow-md">
            <div className="aspect-square bg-slate-50">
              <img src={productImage(product)} alt={product.name} className="h-full w-full object-contain" />
            </div>
            <div className="p-3">
              <p className="line-clamp-2 min-h-10 text-sm font-black">{product.name}</p>
              <p className="mt-1 text-xs font-bold text-slate-400">{product.imageUrl ? "Image set" : "Needs image"}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
