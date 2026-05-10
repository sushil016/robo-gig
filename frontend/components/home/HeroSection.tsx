"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { motion } from "framer-motion";
import { homeHero, serviceTiles } from "@/data/homepage";
import { homeIcons } from "./home-icons";

export function HeroSection() {
  const Sparkles = homeIcons.sparkles;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", { opacity: 0, y: 18, duration: 0.55 })
        .from(".hero-h1", { opacity: 0, y: 48, duration: 0.75, skewY: 1 }, "-=0.25")
        .from(".hero-desc", { opacity: 0, y: 24, duration: 0.55 }, "-=0.3")
        .from(".hero-cta a", { opacity: 0, y: 20, stagger: 0.12, duration: 0.5 }, "-=0.25");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="border-b border-[#D8D8C4] bg-[#FAFAED]" ref={containerRef}>
      <div className="relative min-h-[560px] overflow-hidden bg-zinc-950">
        <Image
          src={homeHero.image}
          alt="Robotics controllers and electronic components"
          fill
          priority
          className="object-cover opacity-60"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.98),rgba(30,64,175,0.72)_48%,rgba(14,165,233,0.18))]" />

        <div className="relative flex min-h-[560px] max-w-4xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
          <div className="hero-badge mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#F3F3E4]/10 px-3 py-1 text-xs font-bold text-blue-100 ring-1 ring-white/20">
            <Sparkles className="h-4 w-4 text-cyan-200" />
            {homeHero.eyebrow}
          </div>
          <h1 className="hero-h1 max-w-3xl text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-7xl">
            {homeHero.title}
          </h1>
          <p className="hero-desc mt-5 max-w-2xl text-base font-medium leading-7 text-blue-50 sm:text-lg">
            {homeHero.description}
          </p>
          <div className="hero-cta mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={homeHero.primaryCta.href}
              className="btn-underline-white inline-flex h-12 items-center justify-center rounded-xl bg-[#1CA2D1] px-7 text-sm font-black text-white transition hover:opacity-90"
            >
              {homeHero.primaryCta.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href={homeHero.secondaryCta.href}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/40 bg-[#F3F3E4]/10 px-7 text-sm font-black text-white transition hover:bg-[#F3F3E4]/20"
            >
              {homeHero.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="overflow-x-auto rounded-2xl border border-[#D8D8C4] bg-[#F3F3E4] shadow-sm scrollbar-hide">
          <motion.div
            className="grid min-w-[760px] grid-cols-4 lg:min-w-0"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.9 } } }}
          >
            {serviceTiles.map((item) => {
              const Icon = homeIcons[item.icon];
              return (
                <motion.div
                  key={item.title}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
                  }}
                >
                  <Link
                    href={item.href}
                    className="card-hover-bar flex min-h-44 items-center justify-between border-r border-[#D8D8C4] px-7 py-6 last:border-r-0 transition"
                  >
                    <span>
                      <span className="block text-2xl font-black leading-tight text-zinc-950 md:text-3xl">
                        {item.title}
                      </span>
                      <span className="mt-3 block text-base font-bold text-zinc-500">
                        {item.copy}
                      </span>
                    </span>
                    <Icon className="h-16 w-16 shrink-0 text-[#1CA2D1]" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
