"use client";

import { FormEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { componentApi } from "@/lib/api/marketplace.api";
import type { ComponentFilters } from "@/lib/types/marketplace.types";
import {
  buildInitialFilters,
  sortPatchFromValue,
  sortValueFromFilters,
  type SortOption,
} from "../lib/catalog";
import { CatalogHero } from "./CatalogHero";
import { CatalogSidebar } from "./CatalogSidebar";
import { ProductCard } from "./ProductCard";

export function MarketplacePage() {
  const [filters, setFilters] = useState<ComponentFilters>(() => buildInitialFilters());
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [minPrice, setMinPrice] = useState(filters.minPrice ? String(filters.minPrice / 100) : "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice ? String(filters.maxPrice / 100) : "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const componentsQuery = useQuery({
    queryKey: ["components", filters],
    queryFn: () => componentApi.getComponents(filters),
  });

  const categoryTreeQuery = useQuery({
    queryKey: ["component-category-tree"],
    queryFn: () => componentApi.getCategoryTree(),
  });

  const categories = categoryTreeQuery.data || [];

  const breadcrumb = useMemo(() => {
    return ["Home", filters.category, filters.subcategory].filter(Boolean).join(" / ");
  }, [filters.category, filters.subcategory]);

  function handleFilterChange(patch: Partial<ComponentFilters>) {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleFilterChange({ search: searchInput || undefined });
  }

  function handleApplyPrice() {
    handleFilterChange({
      minPrice: minPrice ? Math.round(Number(minPrice) * 100) : undefined,
      maxPrice: maxPrice ? Math.round(Number(maxPrice) * 100) : undefined,
    });
  }

  function handlePageChange(page: number) {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="bg-white text-slate-950">
      <CatalogHero categories={categories} filters={filters} onFilterChange={handleFilterChange} />

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <CatalogSidebar
            categories={categories}
            filters={filters}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPrice={setMinPrice}
            onMaxPrice={setMaxPrice}
            onFilterChange={handleFilterChange}
            onApplyPrice={handleApplyPrice}
          />
        </div>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-white lg:hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <p className="font-black">Filters</p>
              <button className="font-black text-blue-700" onClick={() => setMobileFiltersOpen(false)}>
                Close
              </button>
            </div>
            <CatalogSidebar
              categories={categories}
              filters={filters}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPrice={setMinPrice}
              onMaxPrice={setMaxPrice}
              onFilterChange={handleFilterChange}
              onApplyPrice={handleApplyPrice}
            />
          </div>
        )}

        <main className="min-w-0 px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">{breadcrumb}</p>
              <p className="mt-1 text-sm font-black text-slate-800">
                {componentsQuery.data
                  ? `Showing ${componentsQuery.data.components.length} of ${componentsQuery.data.total} products`
                  : "Loading products"}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-black lg:hidden"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </button>
              <form onSubmit={handleSearch} className="flex overflow-hidden rounded-md border border-slate-300 bg-white">
                <div className="flex min-w-0 items-center gap-2 px-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search products"
                    className="h-10 w-56 bg-transparent text-sm font-semibold outline-none"
                  />
                </div>
                <button className="bg-blue-700 px-4 text-sm font-black text-white">Search</button>
              </form>
              <select
                value={sortValueFromFilters(filters)}
                onChange={(event) => handleFilterChange(sortPatchFromValue(event.target.value as SortOption))}
                className="h-11 rounded-md border border-slate-300 px-3 text-sm font-black outline-none"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price low to high</option>
                <option value="price-desc">Price high to low</option>
                <option value="createdAt-desc">Newest first</option>
                <option value="createdAt-asc">Oldest first</option>
              </select>
            </div>
          </div>

          {componentsQuery.isLoading && (
            <div className="py-20 text-center text-sm font-black text-slate-500">Loading products...</div>
          )}

          {componentsQuery.error && (
            <div className="py-20 text-center">
              <p className="text-lg font-black text-red-600">Failed to load components</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">Please refresh and try again.</p>
            </div>
          )}

          {componentsQuery.data?.components.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-lg font-black">No components found</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">Try changing category, subcategory, or search.</p>
            </div>
          )}

          {!!componentsQuery.data?.components.length && (
            <>
              <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                {componentsQuery.data.components.map((component) => (
                  <ProductCard key={component.id} component={component} />
                ))}
              </div>

              {componentsQuery.data.totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange((filters.page || 1) - 1)}
                    disabled={filters.page === 1}
                    className="h-10 rounded-md border border-slate-300 px-4 text-sm font-black disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {Array.from({ length: componentsQuery.data.totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-10 w-10 rounded-md text-sm font-black ${
                        filters.page === page ? "bg-blue-700 text-white" : "border border-slate-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange((filters.page || 1) + 1)}
                    disabled={filters.page === componentsQuery.data.totalPages}
                    className="h-10 rounded-md border border-slate-300 px-4 text-sm font-black disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
