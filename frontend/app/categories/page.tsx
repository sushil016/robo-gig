"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, PackageSearch } from "lucide-react";
import { componentApi } from "@/lib/api/marketplace.api";
import { catalogNavigationGroups } from "@/data/catalog-navigation";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategorySidebar } from "@/components/categories/CategorySidebar";
import type { CategoryCardProps } from "@/components/categories/CategoryCard";

export default function CategoriesPage() {
  const { data: apiCategories, isLoading } = useQuery({
    queryKey: ["component-category-tree"],
    queryFn: componentApi.getCategoryTree,
  });

  // Build merged category list: static nav data enriched with API counts
  const categories: CategoryCardProps[] = catalogNavigationGroups.map((group, index) => {
    const apiMatch = apiCategories?.find(
      (c) => c.category.toLowerCase() === group.name.toLowerCase()
    );

    return {
      index,
      name: group.name,
      description: group.description,
      href: group.href,
      totalCount: apiMatch?.count,
      subcategories: group.subcategories.map((sub) => {
        const apiSub = apiMatch?.subcategories.find(
          (s) => s.name.toLowerCase() === sub.name.toLowerCase()
        );
        return {
          name: sub.name,
          href: sub.href,
          count: apiSub?.count,
        };
      }),
    };
  });

  // Count map for sidebar badges
  const counts: Record<string, number> = {};
  apiCategories?.forEach((c) => { counts[c.category] = c.count; });

  return (
    <div className="min-h-screen bg-[#FAFAED]">
      {/* Page header */}
      <div className="border-b border-[#D8D8C4] bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#1CA2D1]">
              Browse Catalog
            </p>
            <h1 className="mt-2 text-4xl font-black leading-tight text-white sm:text-5xl">
              All Electronics
              <br />
              <span className="text-zinc-500">Categories</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-zinc-400">
              From microcontrollers to motors, sensors to satellites — browse the full RoboRoot
              catalog by category, then drill into the exact subcategory you need.
            </p>
          </motion.div>

          {/* Stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="mt-8 flex flex-wrap gap-6"
          >
            {[
              { label: "Categories", value: catalogNavigationGroups.length },
              {
                label: "Subcategories",
                value: catalogNavigationGroups.reduce((a, g) => a + g.subcategories.length, 0),
              },
              {
                label: "Total Products",
                value: apiCategories
                  ? apiCategories.reduce((a, c) => a + c.count, 0).toLocaleString()
                  : "—",
              },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-2xl font-black tabular-nums text-white">{stat.value}</span>
                <span className="text-xs font-semibold text-zinc-500">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Main layout — sidebar + grid */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex gap-8 lg:gap-10">
          {/* Sidebar — hidden on mobile, visible lg+ */}
          <div className="hidden w-64 shrink-0 lg:block xl:w-72">
            <CategorySidebar counts={counts} />
          </div>

          {/* Category grid */}
          <div className="min-w-0 flex-1">
            {isLoading && (
              <div className="flex min-h-64 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-[#1CA2D1]" />
              </div>
            )}

            {!isLoading && categories.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-[#D8D8C4] bg-[#F3F3E4] p-10 text-center">
                <PackageSearch className="h-10 w-10 text-zinc-400" />
                <p className="font-black text-zinc-600">No categories found yet.</p>
              </div>
            )}

            {categories.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {categories.map((cat) => (
                  <CategoryCard key={cat.name} {...cat} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
