import Image from "next/image";
import Link from "next/link";
import { bestSellingProducts } from "@/data/homepage";

export function BestSellersSection() {
  return (
    <section className="border-y border-[#d4d4b8] bg-[#F5F5DC]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1CA2D1]">
            Best Selling Products
          </p>
          <h2 className="mt-2 text-3xl font-black text-zinc-950">Fast-moving catalog picks</h2>
          <p className="mt-4 text-sm font-medium leading-6 text-zinc-600">
            Components, modules, tools, and Robomaniac learning products that fit common build workflows.
          </p>
          <Link
            href="/components?isBestSeller=true"
            className="btn-underline-white mt-6 inline-flex h-11 items-center rounded-md bg-[#1CA2D1] px-5 text-sm font-black text-white"
          >
            View Best Sellers
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bestSellingProducts.map((component) => (
            <Link
              key={component.name}
              href="/components?isBestSeller=true"
              className="card-hover-bar group overflow-hidden rounded-lg border border-[#d4d4b8] bg-white shadow-sm transition"
            >
              <div className="relative aspect-[4/3] bg-[#e8e8d0]">
                <Image
                  src="/homepage/components.png"
                  alt={component.name}
                  fill
                  className="object-cover opacity-80"
                  sizes="(min-width: 1280px) 280px, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 min-h-12 text-base font-black leading-6 text-zinc-950">
                  {component.name}
                </h3>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xl font-black text-[#1CA2D1]">{component.price}</span>
                  <span className="rounded-full bg-[#F5F5DC] px-3 py-1 text-xs font-bold text-zinc-600">
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
