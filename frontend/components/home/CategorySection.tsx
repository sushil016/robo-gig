import Link from "next/link";
import { featuredCategories } from "@/data/homepage";
import { homeIcons } from "./home-icons";

export function CategorySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
            Shop By Category
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">All electronics categories</h2>
        </div>
        <Link
          href="/categories"
          className="inline-flex h-11 w-fit items-center justify-center rounded-md border border-blue-200 px-5 text-sm font-black text-blue-700 transition hover:bg-blue-50"
        >
          Browse Category Tree
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featuredCategories.map((category) => {
          const Icon = homeIcons[category.icon];

          return (
            <Link
              key={category.name}
              href={category.href}
              className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-blue-50 text-blue-700 transition group-hover:bg-cyan-50 group-hover:text-cyan-700">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-lg font-black">{category.name}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">{category.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
