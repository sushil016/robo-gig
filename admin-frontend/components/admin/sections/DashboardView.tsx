"use client";

/* eslint-disable @next/next/no-img-element */

import type { Product, CategoryNode, Project, AdminSection } from "@/types";
import { productImage, priceLabel } from "@/utils";

export type StatCard = {
  label: string;
  value: number | string;
  detail: string;
};

export function DashboardView({
  stats,
  products,
  categories,
  projects,
  onEditProduct,
  onSelectSection,
}: {
  stats: StatCard[];
  products: Product[];
  categories: CategoryNode[];
  projects: Project[];
  onEditProduct: (product?: Product, targetSection?: AdminSection) => void;
  onSelectSection: (section: AdminSection) => void;
}) {
  const lowStock = products.filter((product) => product.stockQuantity <= 10).slice(0, 5);
  const heroProduct = products.find((product) => product.imageUrl) || products[0];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-lg bg-slate-950 p-6 text-white shadow-sm">
        <img src={productImage(heroProduct)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-blue-950/50" />
        <div className="relative max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-200">Control Room</p>
          <h2 className="mt-3 text-4xl font-black">Manage small parts, big systems, courses, projects, and media.</h2>
          <p className="mt-4 text-sm font-semibold leading-6 text-slate-300">
            This console controls products, category structure, subcategory browsing, Robomaniac items, project videos, and product imagery.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => onSelectSection("products")} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-black text-white">
              Add Product
            </button>
            <button onClick={() => onSelectSection("catalog")} className="rounded-md bg-white px-4 py-2 text-sm font-black text-slate-950">
              Browse Catalog
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-black text-blue-700">{stat.value}</p>
            <p className="mt-1 text-xs font-bold text-slate-400">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Category Health</p>
              <h3 className="mt-1 text-2xl font-black">Catalog groups</h3>
            </div>
            <button onClick={() => onSelectSection("categories")} className="admin-action">Manage</button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {categories.slice(0, 8).map((category) => (
              <button
                key={category.category}
                onClick={() => onSelectSection("catalog")}
                className="rounded-md border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
              >
                <p className="font-black">{category.category}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{category.count} products / {category.subcategories.length} subcategories</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Needs Attention</p>
          <h3 className="mt-1 text-2xl font-black">Low stock</h3>
          <div className="mt-5 space-y-3">
            {lowStock.length === 0 && <p className="text-sm font-semibold text-slate-500">No low-stock products.</p>}
            {lowStock.map((product) => (
              <button key={product.id} onClick={() => onEditProduct(product)} className="flex w-full gap-3 rounded-md border border-slate-200 p-3 text-left hover:bg-slate-50">
                <img src={productImage(product)} alt={product.name} className="h-14 w-14 rounded-md object-cover" />
                <span className="min-w-0">
                  <span className="block truncate font-black">{product.name}</span>
                  <span className="text-xs font-bold text-red-600">{product.stockQuantity} left</span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-5 text-sm font-bold text-slate-500">{projects.length} projects are available in the admin workspace.</p>
        </div>
      </section>
    </div>
  );
}
