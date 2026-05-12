"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Cpu, Gauge, Code2, Cog, Battery, Plane, ShoppingBag, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Semiconductors: Cpu,
  Sensors: Gauge,
  "Development Boards": Code2,
  "Motors & Actuators": Cog,
  "Power & Batteries": Battery,
  "Drones & Aerospace": Plane,
  "Robomaniac Store": ShoppingBag,
  "Tools & Prototyping": Wrench,
};

const ACCENT_MAP: string[] = [
  "from-[#1CA2D1]/20 to-[#1CA2D1]/5 border-[#1CA2D1]/30",
  "from-emerald-400/20 to-emerald-400/5 border-emerald-400/30",
  "from-violet-400/20 to-violet-400/5 border-violet-400/30",
  "from-orange-400/20 to-orange-400/5 border-orange-400/30",
  "from-amber-400/20 to-amber-400/5 border-amber-400/30",
  "from-sky-400/20 to-sky-400/5 border-sky-400/30",
  "from-rose-400/20 to-rose-400/5 border-rose-400/30",
  "from-zinc-400/20 to-zinc-400/5 border-zinc-400/30",
];

const ICON_BG: string[] = [
  "bg-[#1CA2D1]/10 text-[#1CA2D1]",
  "bg-emerald-500/10 text-emerald-500",
  "bg-violet-500/10 text-violet-500",
  "bg-orange-500/10 text-orange-500",
  "bg-amber-500/10 text-amber-500",
  "bg-sky-500/10 text-sky-500",
  "bg-rose-500/10 text-rose-500",
  "bg-zinc-500/10 text-zinc-500",
];

export interface CategorySubcategory {
  name: string;
  href: string;
  count?: number;
}

export interface CategoryCardProps {
  index: number;
  name: string;
  description: string;
  href: string;
  subcategories: CategorySubcategory[];
  totalCount?: number;
}

export function CategoryCard({ index, name, description, href, subcategories, totalCount }: CategoryCardProps) {
  const Icon = ICON_MAP[name] ?? Cpu;
  const accent = ACCENT_MAP[index % ACCENT_MAP.length];
  const iconBg = ICON_BG[index % ICON_BG.length];
  const num = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.07 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#D8D8C4] bg-[#F3F3E4] shadow-sm transition-shadow hover:shadow-lg"
    >
      {/* Icon area — gradient background that shifts on hover */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${accent} border-b border-[#D8D8C4] px-6 pb-5 pt-6`}>
        {/* Ghost number */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-2 -top-4 select-none text-[88px] font-black leading-none text-zinc-950/[0.05]"
        >
          {num}
        </span>

        <div className="flex items-start justify-between">
          {/* Icon */}
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg} ring-1 ring-current/10`}>
            <Icon className="h-7 w-7" strokeWidth={1.7} />
          </div>

          {/* Count pill */}
          {totalCount !== undefined && (
            <span className="rounded-full bg-white/60 px-3 py-1 text-[11px] font-black tabular-nums text-zinc-700 ring-1 ring-zinc-200/80 backdrop-blur-sm">
              {totalCount.toLocaleString()} items
            </span>
          )}
        </div>

        <h2 className="mt-4 text-xl font-black leading-tight text-zinc-950">{name}</h2>
        <p className="mt-1.5 text-sm font-medium leading-relaxed text-zinc-500 line-clamp-2">{description}</p>
      </div>

      {/* Subcategory chips */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          {subcategories.map((sub) => (
            <Link
              key={sub.name}
              href={sub.href}
              onClick={(e) => e.stopPropagation()}
              className="group/chip inline-flex items-center gap-1.5 rounded-lg bg-[#EAEADB] px-2.5 py-1.5 text-xs font-bold text-zinc-700 ring-1 ring-transparent transition-all hover:bg-zinc-950 hover:text-white hover:ring-zinc-800"
            >
              <span className="h-1 w-1 rounded-full bg-zinc-400 transition-colors group-hover/chip:bg-[#1CA2D1]" />
              {sub.name}
              {sub.count !== undefined && (
                <span className="ml-0.5 tabular-nums opacity-50">{sub.count}</span>
              )}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-auto pt-5">
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-xl border border-[#D8D8C4] bg-[#FAFAED] px-4 py-2.5 text-sm font-black text-zinc-800 transition-all hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
          >
            Browse {name}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
