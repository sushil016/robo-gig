"use client";

/* eslint-disable @next/next/no-img-element */

import type { FormEvent } from "react";
import type { Product, ProductForm } from "@/types";
import { productImage, priceLabel } from "@/utils";
import { ProductFormPanel } from "./ProductFormPanel";

export function ProductsView({
  productForm,
  products,
  productSearch,
  isLoading,
  onSearch,
  onForm,
  onSubmit,
  onNew,
  onEdit,
  onArchive,
}: {
  productForm: ProductForm;
  products: Product[];
  productSearch: string;
  isLoading: boolean;
  onSearch: (value: string) => void;
  onForm: (value: ProductForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNew: () => void;
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <ProductFormPanel productForm={productForm} isLoading={isLoading} onForm={onForm} onSubmit={onSubmit} onNew={onNew} />

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Product Control</p>
            <h2 className="mt-1 text-2xl font-black">All components and products</h2>
          </div>
          <input className="admin-input md:w-80" placeholder="Search product, category, tag" value={productSearch} onChange={(event) => onSearch(event.target.value)} />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="flex gap-4 rounded-lg border border-slate-200 bg-white p-3">
              <img src={productImage(product)} alt={product.name} className="h-24 w-24 rounded-md object-contain" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-black">{product.name}</p>
                <p className="text-xs font-bold text-slate-500">{product.category} / {product.subcategory}</p>
                <p className="mt-2 font-black text-blue-700">{priceLabel(product.unitPriceCents)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="admin-action" onClick={() => onEdit(product)} type="button">Edit</button>
                  <button className="admin-action" onClick={() => onArchive(product)} type="button">Archive</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
