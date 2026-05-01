'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { componentApi } from '@/lib/api/marketplace.api';
import { formatPrice } from '@/lib/store/cartStore';
import { BookOpen, Boxes, Code2, GraduationCap, Loader2, ShoppingBag } from 'lucide-react';

const storeCollections = [
  {
    title: 'Robotics Course Kits',
    copy: 'Hands-on kits for classroom and lab programs.',
    icon: GraduationCap,
  },
  {
    title: 'Robomaniac Books',
    copy: 'Robotics and AI learning material from Robomaniac.',
    icon: BookOpen,
  },
  {
    title: 'BlockSquare Software',
    copy: 'Visual programming software for learning logic and robotics.',
    icon: Code2,
  },
];

export default function RobomaniacStorePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['robomaniac-products'],
    queryFn: () =>
      componentApi.getComponents({
        isRobomaniacItem: true,
        limit: 50,
        sortBy: 'name',
        sortOrder: 'asc',
      }),
  });

  return (
    <div className="bg-white text-slate-950">
      <section className="relative overflow-hidden bg-[#26185f]">
        <div className="absolute inset-0 opacity-20">
          <Image src="/homepage/components.png" alt="" fill className="object-cover" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-14 text-white">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-300">
              Robomaniac Store
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">
              Course kits, robotics books, and BlockSquare software.
            </h1>
            <p className="mt-5 text-lg font-medium leading-8 text-violet-100">
              A dedicated store for Robomaniac learning products, including Lego robotics course
              kits, robotics course kits, AI books, and the BlockSquare software product.
            </p>
            <Link
              href="/components?isRobomaniacItem=true"
              className="mt-7 inline-flex h-12 items-center rounded-md bg-orange-500 px-6 text-sm font-black text-white transition hover:bg-orange-600"
            >
              Browse Robomaniac Items
              <ShoppingBag className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 md:grid-cols-3">
        {storeCollections.map((collection) => {
          const Icon = collection.icon;
          return (
            <div key={collection.title} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-[#2f2178] shadow-sm">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-black">{collection.title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{collection.copy}</p>
            </div>
          );
        })}
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-600">
                Store Products
              </p>
              <h2 className="mt-2 text-3xl font-black">Robomaniac catalog</h2>
            </div>
            <Link href="/categories" className="text-sm font-black text-[#2f2178]">
              Browse all categories
            </Link>
          </div>

          {isLoading && (
            <div className="flex min-h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#2f2178]" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-white p-8 text-center text-red-600">
              Failed to load Robomaniac items.
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data?.components.map((product) => (
              <Link
                key={product.id}
                href={`/components/${product.id}`}
                className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-orange-500">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover transition group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Boxes className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-xs font-black uppercase tracking-wide text-orange-600">
                    {product.subcategory}
                  </p>
                  <h3 className="mt-1 min-h-12 text-base font-black leading-6">{product.name}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-black text-[#2f2178]">
                      {formatPrice(product.unitPriceCents)}
                    </span>
                    {product.isSoftware && (
                      <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-bold text-violet-700">
                        Software
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
