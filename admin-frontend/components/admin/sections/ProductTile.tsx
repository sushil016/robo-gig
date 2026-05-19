"use client";

/* eslint-disable @next/next/no-img-element */

import type { Product } from "@/types";
import { productImage, priceLabel } from "@/utils";

export function ProductTile({
  product,
  onEdit,
  onArchive,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
}) {
  return (
    <article className="group text-center">
      <div className="relative mx-auto flex aspect-square w-full max-w-52 items-center justify-center overflow-hidden rounded-md bg-white">
        {product.isBestSeller && (
          <span className="absolute right-2 top-2 z-10 bg-blue-600 px-2 py-1 text-xs font-black text-white">Best</span>
        )}
        <img src={productImage(product)} alt={product.name} className="h-full w-full object-contain transition group-hover:scale-105" />
        <div className="absolute inset-x-3 bottom-3 hidden gap-2 group-hover:flex">
          <button onClick={() => onEdit(product)} className="flex-1 rounded-md bg-slate-950 px-3 py-2 text-xs font-black text-white">Edit</button>
          <button onClick={() => onArchive(product)} className="flex-1 rounded-md bg-white px-3 py-2 text-xs font-black text-slate-950 shadow">Archive</button>
        </div>
      </div>
      <h3 className="mt-4 text-sm font-black leading-6 text-slate-800">{product.name}</h3>
      <p className="mt-1 text-xs font-bold text-slate-400">{product.brand || product.productType}</p>
      <p className="mt-2 text-sm font-black text-blue-700">{priceLabel(product.unitPriceCents)}</p>
    </article>
  );
}
