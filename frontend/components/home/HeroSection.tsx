import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { homeHero, serviceTiles } from "@/data/homepage";
import { homeIcons } from "./home-icons";

export function HeroSection() {
  const Sparkles = homeIcons.sparkles;

  return (
    <section className="border-b border-blue-100 bg-slate-50">
      <div className="relative min-h-[540px] overflow-hidden bg-blue-950">
        <Image
          src={homeHero.image}
          alt="Robotics controllers and electronic components"
          fill
          priority
          className="object-cover opacity-60"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.98),rgba(30,64,175,0.72)_48%,rgba(14,165,233,0.18))]" />

        <div className="relative flex min-h-[540px] max-w-4xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-100 ring-1 ring-white/20">
            <Sparkles className="h-4 w-4 text-cyan-200" />
            {homeHero.eyebrow}
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-7xl">
            {homeHero.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-blue-50 sm:text-lg">
            {homeHero.description}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={homeHero.primaryCta.href}
              className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-6 text-sm font-black text-white transition hover:bg-blue-700"
            >
              {homeHero.primaryCta.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href={homeHero.secondaryCta.href}
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/40 bg-white/10 px-6 text-sm font-black text-white transition hover:bg-white/20"
            >
              {homeHero.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white shadow-lg scrollbar-hide">
          <div className="grid min-w-[760px] grid-cols-4 lg:min-w-0">
            {serviceTiles.map((item) => {
              const Icon = homeIcons[item.icon];

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`${item.tone} flex min-h-44 items-center justify-between border-r border-white/80 px-7 py-6 last:border-r-0 transition hover:brightness-95`}
                >
                  <span>
                    <span className="block text-2xl font-black leading-tight md:text-3xl">
                      {item.title}
                    </span>
                    <span className="mt-3 block text-base font-bold opacity-80">
                      {item.copy}
                    </span>
                  </span>
                  <Icon className="h-16 w-16 shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
