"use client";

/* eslint-disable @next/next/no-img-element */

import type { FormEvent } from "react";
import type { ProductForm, ProductType } from "@/types";
import { productTypes } from "@/config/forms";
import { compactType, productImage } from "@/utils";
import { useAdmin } from "@/core/context/AdminContext";
import { ProductMediaManager } from "./ProductMediaManager";

export function ProductFormPanel({
  productForm,
  isLoading,
  onForm,
  onSubmit,
  onNew,
}: {
  productForm: ProductForm;
  isLoading: boolean;
  onForm: (value: ProductForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNew: () => void;
}) {
  const { token } = useAdmin();

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Product Manager</p>
            <h2 className="mt-1 text-2xl font-black">{productForm.id ? "Edit product" : "Create product"}</h2>
          </div>
          <button type="button" onClick={onNew} className="admin-action">New</button>
        </div>

        <div className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          <img src={productForm.imageUrl || productImage()} alt="" className="h-48 w-full object-contain" />
        </div>

        <div className="mt-5 grid gap-3">
          <input className="admin-input" placeholder="Product name" value={productForm.name} onChange={(event) => onForm({ ...productForm, name: event.target.value })} required />
          <input className="admin-input" placeholder="SKU" value={productForm.sku} onChange={(event) => onForm({ ...productForm, sku: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="admin-input" placeholder="Category" value={productForm.category} onChange={(event) => onForm({ ...productForm, category: event.target.value })} required />
            <input className="admin-input" placeholder="Subcategory" value={productForm.subcategory} onChange={(event) => onForm({ ...productForm, subcategory: event.target.value })} required />
          </div>
          <select className="admin-input" value={productForm.productType} onChange={(event) => onForm({ ...productForm, productType: event.target.value as ProductType })}>
            {productTypes.map((type) => <option key={type} value={type}>{compactType(type)}</option>)}
          </select>
          <input className="admin-input" placeholder="Brand" value={productForm.brand} onChange={(event) => onForm({ ...productForm, brand: event.target.value })} />
          <textarea className="admin-textarea" placeholder="Description" value={productForm.description} onChange={(event) => onForm({ ...productForm, description: event.target.value })} />
          <textarea className="admin-textarea" placeholder="Typical use case" value={productForm.typicalUseCase} onChange={(event) => onForm({ ...productForm, typicalUseCase: event.target.value })} />
          <input className="admin-input" placeholder="Main image URL (thumbnail)" value={productForm.imageUrl} onChange={(event) => onForm({ ...productForm, imageUrl: event.target.value })} />
          <input className="admin-input" placeholder="Vendor link" value={productForm.vendorLink} onChange={(event) => onForm({ ...productForm, vendorLink: event.target.value })} />
          <input className="admin-input" placeholder="Tags, comma separated" value={productForm.tags} onChange={(event) => onForm({ ...productForm, tags: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="admin-input" type="number" min="0" step="0.01" placeholder="Price INR" value={productForm.unitPrice} onChange={(event) => onForm({ ...productForm, unitPrice: event.target.value })} required />
            <input className="admin-input" type="number" min="0" placeholder="Stock" value={productForm.stockQuantity} onChange={(event) => onForm({ ...productForm, stockQuantity: event.target.value })} required />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["Best seller", "isBestSeller"],
              ["Robomaniac item", "isRobomaniacItem"],
              ["Software", "isSoftware"],
              ["Active", "isActive"],
            ].map(([label, key]) => (
              <label key={key} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={Boolean(productForm[key as keyof ProductForm])}
                  onChange={(event) => onForm({ ...productForm, [key]: event.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>
          <button className="h-11 rounded-md bg-blue-700 px-5 text-sm font-black text-white" disabled={isLoading}>
            {productForm.id ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>

      {/* Multi-media manager — only shown when editing an existing product */}
      {productForm.id && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <ProductMediaManager productId={productForm.id} token={token} />
        </div>
      )}
    </div>
  );
}
