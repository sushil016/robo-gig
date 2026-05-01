'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { componentApi } from '@/lib/api/marketplace.api';
import { formatPrice } from '@/lib/store/cartStore';
import { Boxes, ChevronRight, Loader2, PackageSearch } from 'lucide-react';

export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['component-category-tree'],
    queryFn: componentApi.getCategoryTree,
  });

  return (
    <div className="bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-600">
            Browse All Categories
          </p>
          <h1 className="mt-2 text-4xl font-black">Category, subcategory, product</h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-slate-600">
            Browse the full electronics catalog the way buyers think: first by category, then
            subcategory, then the exact product they need.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {isLoading && (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#2f2178]" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-white p-8 text-center text-red-600">
            Failed to load categories.
          </div>
        )}

        {categories && categories.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <PackageSearch className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 font-bold">No products found yet.</p>
          </div>
        )}

        <div className="space-y-6">
          {categories?.map((category) => (
            <section key={category.category} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black">{category.category}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {category.count} products across {category.subcategories.length} subcategories
                  </p>
                </div>
                <Link
                  href={`/components?category=${encodeURIComponent(category.category)}`}
                  className="inline-flex h-10 w-fit items-center rounded-md bg-[#2f2178] px-4 text-sm font-black text-white"
                >
                  View category
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.name} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-black">{subcategory.name}</h3>
                        <p className="text-xs font-semibold text-slate-500">{subcategory.count} products</p>
                      </div>
                      <Link
                        href={`/components?category=${encodeURIComponent(category.category)}&subcategory=${encodeURIComponent(subcategory.name)}`}
                        className="text-sm font-black text-orange-600 hover:text-orange-700"
                      >
                        Browse
                      </Link>
                    </div>

                    <div className="space-y-2">
                      {subcategory.products.slice(0, 4).map((product) => (
                        <Link
                          key={product.id}
                          href={`/components/${product.id}`}
                          className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-3 text-sm shadow-sm transition hover:bg-orange-50"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <Boxes className="h-4 w-4 shrink-0 text-[#2f2178]" />
                            <span className="truncate font-bold">{product.name}</span>
                          </span>
                          <span className="shrink-0 font-black text-[#2f2178]">
                            {formatPrice(product.unitPriceCents)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
