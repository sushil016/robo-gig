"use client";

/* eslint-disable @next/next/no-img-element */

import type { ComponentCategoryNode, ComponentFilters } from "@/lib/types/marketplace.types";
import { categoryHeroImage } from "../lib/catalog";

type CatalogHeroProps = {
  categories: ComponentCategoryNode[];
  filters: ComponentFilters;
  onFilterChange: (filters: Partial<ComponentFilters>) => void;
};

export function CatalogHero({ categories, filters, onFilterChange }: CatalogHeroProps) {
  const selectedCategory = categories.find((category) => category.category === filters.category);
  const title = filters.subcategory || selectedCategory?.category || "All Electronics Components";

  return (
    <section className="relative min-h-80 overflow-hidden bg-slate-950 px-5 py-12 text-white">
      <img
        src={categoryHeroImage(selectedCategory)}
        alt=""
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-35 blur-sm"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-slate-950/85 to-black/60" />
      <div className="relative mx-auto max-w-7xl">
        <h1 className="text-center text-4xl font-black sm:text-6xl">← {title}</h1>
        <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-6">
          {categories.map((category) => (
            <button
              key={category.category}
              onClick={() => onFilterChange({ category: category.category, subcategory: undefined })}
              className={`flex items-center gap-3 text-left transition ${
                filters.category === category.category ? "text-cyan-200" : "text-white/85 hover:text-white"
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
  );
}
