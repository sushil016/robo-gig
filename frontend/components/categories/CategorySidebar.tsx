"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { catalogNavigationGroups } from "@/data/catalog-navigation";

interface CategorySidebarProps {
  activeCategory?: string;
  counts?: Record<string, number>;
}

export function CategorySidebar({ activeCategory, counts }: CategorySidebarProps) {
  const [expanded, setExpanded] = useState<string | null>(
    activeCategory ?? catalogNavigationGroups[0].name
  );
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <aside className="sticky top-20 h-[calc(100vh-6rem)] w-full overflow-y-auto scrollbar-hide">
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1CA2D1]/10 ring-1 ring-[#1CA2D1]/20">
            <LayoutGrid className="h-4 w-4 text-[#1CA2D1]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1CA2D1]">Catalog</p>
            <p className="text-sm font-black text-white">All Categories</p>
          </div>
        </div>

        {/* Category list */}
        <nav className="p-2">
          {catalogNavigationGroups.map((group, i) => {
            const isExpanded = expanded === group.name;
            const isHovered = hovered === group.name;
            const count = counts?.[group.name];

            return (
              <div key={group.name}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : group.name)}
                  onMouseEnter={() => setHovered(group.name)}
                  onMouseLeave={() => setHovered(null)}
                  className={`group relative w-full overflow-hidden rounded-xl px-3 py-2.5 text-left transition-colors ${
                    isExpanded ? "bg-zinc-800" : "hover:bg-zinc-900"
                  }`}
                >
                  {/* Hover shimmer bar */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isHovered && !isExpanded ? 1 : 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute left-0 top-0 h-full w-[3px] origin-left rounded-l-xl bg-[#1CA2D1]"
                  />

                  <div className="flex items-center gap-2.5">
                    <span
                      className={`min-w-[1.5rem] text-[10px] font-black tabular-nums transition-colors ${
                        isExpanded ? "text-[#1CA2D1]" : "text-zinc-600 group-hover:text-zinc-500"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span
                      className={`flex-1 text-sm font-bold leading-snug transition-colors ${
                        isExpanded ? "text-white" : "text-zinc-300 group-hover:text-white"
                      }`}
                    >
                      {group.name}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {count !== undefined && (
                        <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-black tabular-nums text-zinc-400">
                          {count}
                        </span>
                      )}
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <ChevronRight
                          className={`h-3.5 w-3.5 transition-colors ${
                            isExpanded ? "text-[#1CA2D1]" : "text-zinc-600"
                          }`}
                        />
                      </motion.div>
                    </div>
                  </div>
                </button>

                {/* Expandable subcategories */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="subcat"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="ml-8 mb-1.5 mt-0.5 space-y-0.5 border-l border-zinc-800 pl-3">
                        {group.subcategories.map((sub, si) => (
                          <motion.div
                            key={sub.name}
                            initial={{ x: -6, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                              duration: 0.22,
                              ease: [0.22, 1, 0.36, 1],
                              delay: si * 0.035,
                            }}
                          >
                            <Link
                              href={sub.href}
                              className="group/sub flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-[#1CA2D1]"
                            >
                              <span className="h-1 w-1 shrink-0 rounded-full bg-zinc-700 transition-colors group-hover/sub:bg-[#1CA2D1]" />
                              {sub.name}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Footer CTA */}
        <div className="border-t border-zinc-800 p-3">
          <Link
            href="/components"
            className="block w-full rounded-xl bg-[#1CA2D1] py-2.5 text-center text-sm font-black text-white transition-opacity hover:opacity-90"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    </aside>
  );
}
