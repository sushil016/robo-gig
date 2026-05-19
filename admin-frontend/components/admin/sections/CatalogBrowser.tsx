"use client";

/* eslint-disable @next/next/no-img-element */

import type { CategoryNode, Product } from "@/types";
import { productImage } from "@/utils";
import { ProductTile } from "./ProductTile";

const categoryBackdrop =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80";

export function CatalogBrowser({
  categories,
  selectedCategory,
  selectedSubcategory,
  products,
  search,
  onSearch,
  onSelectCategory,
  onSelectSubcategory,
  onEditProduct,
  onArchiveProduct,
}: {
  categories: CategoryNode[];
  selectedCategory?: CategoryNode;
  selectedSubcategory: string;
  products: Product[];
  search: string;
  onSearch: (value: string) => void;
  onSelectCategory: (value: string) => void;
  onSelectSubcategory: (value: string) => void;
  onEditProduct: (product: Product) => void;
  onArchiveProduct: (product: Product) => void;
}) {
  const firstProduct = selectedCategory?.subcategories.flatMap((subcategory) => subcategory.products).find((product) => product.imageUrl);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <section className="relative min-h-72 overflow-hidden bg-slate-950 px-6 py-10 text-white">
        <img src={firstProduct ? productImage(firstProduct) : categoryBackdrop} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35 blur-sm scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-slate-950/80 to-black/60" />
        <div className="relative">
          <h2 className="text-center text-5xl font-black">← {selectedCategory?.category || "Catalog"}</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-6">
            {categories.map((category) => (
              <button
                key={category.category}
                onClick={() => onSelectCategory(category.category)}
                className={`flex items-center gap-3 text-left transition ${
                  selectedCategory?.category === category.category ? "text-cyan-200" : "text-white/85 hover:text-white"
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/10 text-xs font-black">
                  {category.category.slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <span className="block text-sm font-black uppercase">{category.category}</span>
                  <span className="text-sm text-white/60">{category.count} Products</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 p-5">
          <h3 className="font-black uppercase tracking-wide text-slate-700">Stock Status</h3>
          <div className="mt-4 space-y-3 text-sm font-semibold text-slate-500">
            <label className="flex items-center gap-2"><input type="checkbox" /> In stock</label>
            <label className="flex items-center gap-2"><input type="checkbox" /> Best seller</label>
            <label className="flex items-center gap-2"><input type="checkbox" /> Robomaniac</label>
          </div>

          <div className="my-6 border-t border-slate-200" />
          <h3 className="font-black uppercase tracking-wide text-slate-700">Subcategories</h3>
          <div className="mt-4 space-y-1">
            <button
              onClick={() => onSelectSubcategory("")}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm font-bold ${
                !selectedSubcategory ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              All in {selectedCategory?.category || "category"}
            </button>
            {selectedCategory?.subcategories.map((subcategory) => (
              <button
                key={subcategory.name}
                onClick={() => onSelectSubcategory(subcategory.name)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-bold ${
                  selectedSubcategory === subcategory.name ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{subcategory.name}</span>
                <span className="text-xs text-slate-400">{subcategory.count}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="p-5">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="text-sm font-semibold text-slate-500">
              Home / {selectedCategory?.category || "Catalog"} {selectedSubcategory ? `/ ${selectedSubcategory}` : ""}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-black">Show: 9 / 24 / 36</span>
              <input className="admin-input w-72" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search visible products" />
            </div>
          </div>

          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            {products.map((product) => (
              <ProductTile key={product.id} product={product} onEdit={onEditProduct} onArchive={onArchiveProduct} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
