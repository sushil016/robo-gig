"use client";

/* eslint-disable @next/next/no-img-element */

import type { CategoryNode, Product } from "@/types";
import { productImage } from "@/utils";

export function CategoriesView({
  categories,
  selectedCategory,
  selectedSubcategory,
  renameCategoryValue,
  renameSubcategoryValue,
  onSelectCategory,
  onSelectSubcategory,
  onRenameCategory,
  onRenameSubcategory,
  onRenameCategorySubmit,
  onRenameSubcategorySubmit,
  onCreateProduct,
  onArchiveGroup,
}: {
  categories: CategoryNode[];
  selectedCategory?: CategoryNode;
  selectedSubcategory?: CategoryNode["subcategories"][number];
  renameCategoryValue: string;
  renameSubcategoryValue: string;
  onSelectCategory: (value: string) => void;
  onSelectSubcategory: (value: string) => void;
  onRenameCategory: (value: string) => void;
  onRenameSubcategory: (value: string) => void;
  onRenameCategorySubmit: () => void;
  onRenameSubcategorySubmit: () => void;
  onCreateProduct: (category: string, subcategory?: string) => void;
  onArchiveGroup: (targets: Product[], label: string) => void;
}) {
  const categoryProducts = selectedCategory?.subcategories.flatMap((subcategory) => subcategory.products) || [];

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Category CRUD</p>
            <h2 className="mt-1 text-2xl font-black">Categories and subcategories</h2>
          </div>
          <button onClick={() => onCreateProduct(selectedCategory?.category || "New Category")} className="rounded-md bg-blue-700 px-4 py-2 text-sm font-black text-white">
            Add product in category
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {categories.map((category) => {
            const hero = category.subcategories.flatMap((subcategory) => subcategory.products).find((product) => product.imageUrl);
            return (
              <button
                key={category.category}
                onClick={() => onSelectCategory(category.category)}
                className={`overflow-hidden rounded-lg border text-left transition ${
                  selectedCategory?.category === category.category ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-200"
                }`}
              >
                <div className="relative h-32 bg-slate-900">
                  <img src={productImage(hero)} alt="" className="h-full w-full object-cover opacity-55" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  <p className="absolute bottom-3 left-4 text-xl font-black text-white">{category.category}</p>
                </div>
                <div className="p-4">
                  <p className="text-sm font-bold text-slate-500">{category.count} products / {category.subcategories.length} subcategories</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {category.subcategories.slice(0, 4).map((subcategory) => (
                      <span key={subcategory.name} className="admin-pill">{subcategory.name}</span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Selected Category</p>
          <h3 className="mt-1 text-2xl font-black">{selectedCategory?.category || "No category"}</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">{categoryProducts.length} products inside this category.</p>
          <div className="mt-5 grid gap-3">
            <input className="admin-input" value={renameCategoryValue} onChange={(event) => onRenameCategory(event.target.value)} placeholder="Rename selected category" />
            <button onClick={onRenameCategorySubmit} className="rounded-md bg-blue-700 px-4 py-2 text-sm font-black text-white">Rename Category</button>
            <button onClick={() => onArchiveGroup(categoryProducts, selectedCategory?.category || "category")} className="rounded-md border border-red-200 px-4 py-2 text-sm font-black text-red-700">Archive Category Products</button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Subcategories</p>
          <div className="mt-4 space-y-2">
            {selectedCategory?.subcategories.map((subcategory) => (
              <button
                key={subcategory.name}
                onClick={() => onSelectSubcategory(subcategory.name)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm font-bold ${
                  selectedSubcategory?.name === subcategory.name ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200"
                }`}
              >
                <span>{subcategory.name}</span>
                <span>{subcategory.count}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-3">
            <input className="admin-input" value={renameSubcategoryValue} onChange={(event) => onRenameSubcategory(event.target.value)} placeholder="Rename selected subcategory" />
            <button onClick={onRenameSubcategorySubmit} className="rounded-md bg-blue-700 px-4 py-2 text-sm font-black text-white">Rename Subcategory</button>
            <button onClick={() => onCreateProduct(selectedCategory?.category || "New Category", selectedSubcategory?.name)} className="admin-action bg-white">Add product here</button>
            <button onClick={() => onArchiveGroup(selectedSubcategory?.products || [], selectedSubcategory?.name || "subcategory")} className="rounded-md border border-red-200 px-4 py-2 text-sm font-black text-red-700">Archive Subcategory Products</button>
          </div>
        </div>
      </aside>
    </section>
  );
}
