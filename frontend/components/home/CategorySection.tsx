"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { featuredCategories } from "@/data/homepage";
import { homeIcons } from "./home-icons";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function CategorySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1CA2D1]">
            Shop By Category
          </p>
          <h2 className="mt-2 text-3xl font-black text-zinc-950">All electronics categories</h2>
        </div>
        <Link
          href="/categories"
          className="btn-underline-white inline-flex h-11 w-fit items-center justify-center rounded-xl bg-[#1CA2D1] px-6 text-sm font-black text-white transition hover:opacity-90"
        >
          Browse Category Tree
        </Link>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {featuredCategories.map((category) => {
          const Icon = homeIcons[category.icon];
          return (
            <motion.div key={category.name} variants={cardVariants}>
              <Link
                href={category.href}
                className="card-hover-bar group block rounded-xl border border-[#D8D8C4] bg-[#F3F3E4] p-5 shadow-sm transition"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FAFAED] text-[#1CA2D1]">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-black text-zinc-950">{category.name}</h3>
                <p className="mt-1 text-sm font-semibold text-zinc-500">{category.description}</p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
