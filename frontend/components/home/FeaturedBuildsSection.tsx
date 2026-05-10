import Link from "next/link";
import { Boxes, PackageCheck } from "lucide-react";
import { projectHighlights } from "@/data/homepage";

export function FeaturedBuildsSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-lg bg-zinc-950 p-6 text-[#F5F5DC] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1CA2D1]">
              Featured Builds
            </p>
            <h2 className="mt-2 text-3xl font-black">Start with a proven project path</h2>
          </div>
          <Link
            href="/projects"
            className="btn-underline-white inline-flex h-11 w-fit items-center rounded-md bg-[#1CA2D1] px-5 text-sm font-black text-white"
          >
            All Projects
          </Link>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {projectHighlights.map((project) => (
            <Link
              key={project.title}
              href={project.href}
              className="card-hover-bar rounded-lg border border-white/10 bg-white/5 p-5 transition"
            >
              <Boxes className="h-8 w-8 text-[#1CA2D1]" />
              <h3 className="mt-5 min-h-14 text-lg font-black leading-7">{project.title}</h3>
              <p className="mt-3 text-sm font-semibold text-zinc-400">{project.meta}</p>
            </Link>
          ))}
        </div>
      </div>

      <aside className="card-hover-bar rounded-lg border border-[#d4d4b8] bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#F5F5DC] text-[#1CA2D1]">
          <PackageCheck className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-black text-zinc-950">Build your BOM faster</h2>
        <p className="mt-3 text-sm font-medium leading-6 text-zinc-600">
          Project pages connect parts to the build plan, so students can understand what to buy
          and why each component matters.
        </p>
        <div className="mt-6 space-y-3 text-sm font-bold text-zinc-700">
          <div className="flex items-center justify-between border-b border-[#d4d4b8] pb-3">
            <span>Catalog categories</span>
            <span className="text-[#1CA2D1]">8+</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#d4d4b8] pb-3">
            <span>Project verticals</span>
            <span className="text-[#1CA2D1]">IoT, AI, UAV</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Robomaniac products</span>
            <span className="text-[#1CA2D1]">Kits + software</span>
          </div>
        </div>
      </aside>
    </section>
  );
}
