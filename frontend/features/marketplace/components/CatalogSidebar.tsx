"use client";

import type { ComponentCategoryNode, ComponentFilters } from "@/lib/types/marketplace.types";

type CatalogSidebarProps = {
  categories: ComponentCategoryNode[];
  filters: ComponentFilters;
  minPrice: string;
  maxPrice: string;
  onMinPrice: (value: string) => void;
  onMaxPrice: (value: string) => void;
  onFilterChange: (filters: Partial<ComponentFilters>) => void;
  onApplyPrice: () => void;
};

export function CatalogSidebar({
  categories,
  filters,
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
  onFilterChange,
  onApplyPrice,
}: CatalogSidebarProps) {
  const selectedCategory = categories.find((category) => category.category === filters.category);

  return (
    <aside className="space-y-7 border-r border-slate-200 bg-white p-5">
      <section>
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">Stock Status</h3>
        <div className="mt-4 space-y-3 text-sm font-semibold text-slate-500">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(filters.inStock)}
              onChange={(event) => onFilterChange({ inStock: event.target.checked })}
            />
            In stock
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(filters.isBestSeller)}
              onChange={(event) => onFilterChange({ isBestSeller: event.target.checked || undefined })}
            />
            Best sellers
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(filters.isRobomaniacItem)}
              onChange={(event) => onFilterChange({ isRobomaniacItem: event.target.checked || undefined })}
            />
            Robomaniac
          </label>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-7">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">Filter by Price</h3>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <input
            value={minPrice}
            onChange={(event) => onMinPrice(event.target.value)}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm font-bold outline-none focus:border-blue-600"
            placeholder="Min ₹"
            type="number"
          />
          <input
            value={maxPrice}
            onChange={(event) => onMaxPrice(event.target.value)}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm font-bold outline-none focus:border-blue-600"
            placeholder="Max ₹"
            type="number"
          />
        </div>
        <button onClick={onApplyPrice} className="mt-3 h-10 rounded-md bg-slate-900 px-4 text-xs font-black text-white">
          Filter
        </button>
      </section>

      <section className="border-t border-slate-200 pt-7">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">Categories</h3>
        <div className="mt-4 space-y-1">
          {categories.map((category) => (
            <div key={category.category}>
              <button
                onClick={() =>
                  onFilterChange({
                    category: category.category,
                    subcategory: undefined,
                  })
                }
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-bold ${
                  filters.category === category.category
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{category.category}</span>
                <span className="text-xs text-slate-400">{category.count}</span>
              </button>
              {selectedCategory?.category === category.category && (
                <div className="ml-3 mt-1 space-y-1 border-l border-slate-200 pl-3">
                  {category.subcategories.map((subcategory) => (
                    <button
                      key={subcategory.name}
                      onClick={() => onFilterChange({ subcategory: subcategory.name })}
                      className={`block w-full rounded-md px-3 py-2 text-left text-xs font-bold ${
                        filters.subcategory === subcategory.name
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-500 hover:text-blue-700"
                      }`}
                    >
                      {subcategory.name} ({subcategory.count})
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
