import Image from "next/image";
import Link from "next/link";
import { bestSellingProducts } from "@/data/homepage";

export function BestSellersSection() {
  return (
    <section className="border-y border-blue-100 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
            Best Selling Products
          </p>
          <h2 className="mt-2 text-3xl font-black">Fast-moving catalog picks</h2>
          <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
            Components, modules, tools, and Robomaniac learning products that fit common build
            workflows.
          </p>
          <Link
            href="/components?isBestSeller=true"
            className="mt-6 inline-flex h-11 items-center rounded-md bg-blue-700 px-5 text-sm font-black text-white transition hover:bg-blue-800"
          >
            View Best Sellers
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bestSellingProducts.map((component) => (
            <Link
              key={component.name}
              href="/components?isBestSeller=true"
              className="group overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] bg-blue-600">
                <Image
                  src="/homepage/components.png"
                  alt={component.name}
                  fill
                  className="object-cover mix-blend-multiply opacity-80 transition group-hover:scale-105"
                  sizes="(min-width: 1280px) 280px, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 min-h-12 text-base font-black leading-6">
                  {component.name}
                </h3>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xl font-black text-blue-700">{component.price}</span>
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                    {component.stock}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
