/**
 * Header Component
 * Main navigation header with RoboRoot branding
 * Shows user menu when authenticated, login/register buttons when not
 */

'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { catalogNavigationGroups } from '@/data/catalog-navigation';
import { UserMenu } from './UserMenu';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  ChevronDown,
  Cpu,
  Heart,
  Mail,
  Menu,
  PackageCheck,
  Search,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  Wrench,
  X,
} from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const cartItemCount = useCartStore((state) => state.getTotalItems());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d4d4b8] bg-[#F5F5DC] text-zinc-950">
      <div className="bg-zinc-950 px-4 py-2 text-center text-sm font-medium text-[#F5F5DC]">
        Electronics components, custom projects, Robomaniac kits, books, and BlockSquare software.
      </div>

      <div className="border-b border-[#d4d4b8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <a
            href="mailto:support@roboroot.in"
            className="hidden items-center gap-2 text-sm font-semibold text-zinc-500 sm:flex"
          >
            <Mail className="h-4 w-4" />
            support@roboroot.in
          </a>

          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#1CA2D1] bg-[#F5F5DC] text-2xl font-black text-[#1CA2D1]">
              R
            </span>
            <span className="leading-none">
              <span className="block text-2xl font-black tracking-wide text-zinc-950">
                ROBO<span className="text-[#1CA2D1]">ROOT</span>
              </span>
              <span className="text-xs font-semibold text-zinc-500">
                Ideas, Parts, Builds
              </span>
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center px-4 lg:flex">
            <form action="/components" className="flex w-full max-w-xl overflow-hidden rounded-md border border-[#d4d4b8] bg-white shadow-sm">
              <div className="flex flex-1 items-center gap-2 px-4">
                <Search className="h-5 w-5 text-zinc-400" />
                <input
                  name="search"
                  aria-label="Search components"
                  placeholder="Search Arduino, ESP32, sensors..."
                  className="h-12 w-full bg-transparent text-sm font-medium outline-none placeholder:text-zinc-400"
                />
              </div>
              <button className="h-12 bg-[#1CA2D1] px-7 text-sm font-bold text-white transition hover:opacity-90">
                Search
              </button>
            </form>
          </div>

          <div className="flex items-center gap-1">
            <Link href="/components" className="hidden md:block">
              <Button variant="ghost" size="icon" aria-label="Components" className="border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all">
                <Cpu className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/projects" className="hidden md:block">
              <Button variant="ghost" size="icon" aria-label="Projects" className="border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all">
                <BookOpen className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" aria-label="Wishlist" className="hidden md:inline-flex border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all">
              <Heart className="h-5 w-5" />
            </Button>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all" aria-label="Cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1CA2D1] text-xs font-bold text-white">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            {isAuthenticated && user ? (
              <UserMenu user={user} />
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button variant="ghost" size="icon" aria-label="Login" className="border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all">
                  <UserRound className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden border border-transparent hover:border-zinc-950 hover:shadow-sm transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-[#d4d4b8] lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <nav className="flex h-14 items-center text-sm font-bold text-zinc-800">
            <div className="group relative flex h-full items-center">
              <Link href="/categories" className="flex h-full items-center gap-2 bg-[#e8e8d0] px-5 text-zinc-950 link-underline-left transition">
                <Menu className="h-5 w-5" />
                All Categories
                <ChevronDown className="h-4 w-4" />
              </Link>
              <CatalogMegaMenu />
            </div>
            <Link href="/" className="flex h-full items-center px-5 text-[#1CA2D1] link-underline-left transition hover:text-zinc-950">
              Home
            </Link>
            <Link href="/projects" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              Projects
            </Link>
            <div className="group relative flex h-full items-center">
              <Link href="/components" className="flex h-full items-center gap-1 px-5 link-underline-left transition hover:text-zinc-950">
                Shop Parts
                <ChevronDown className="h-4 w-4" />
              </Link>
              <CatalogMegaMenu align="wide" />
            </div>
            <Link href="/categories" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              Categories
            </Link>
            <Link href="/projects?difficulty=BEGINNER" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              Starter Builds
            </Link>
            <Link href="/robomaniac-store" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              Robomaniac Store
            </Link>
            <Link href="/projects?category=ROBOTICS" className="flex h-full items-center px-5 link-underline-left transition hover:text-zinc-950">
              Robotics Kits
            </Link>
          </nav>
          <Link href="/components" className="btn-underline-white flex h-14 items-center gap-2 border-x border-[#d4d4b8] bg-[#1CA2D1] px-5 text-sm font-bold text-white transition hover:opacity-90">
            <ShoppingBag className="h-5 w-5" />
            Browse Store
          </Link>
        </div>
      </div>

      <div className="lg:hidden">
        {mobileMenuOpen && (
          <div className="space-y-2 border-t border-[#d4d4b8] bg-[#F5F5DC] px-4 py-4">
            <form action="/components" className="flex overflow-hidden rounded-md border border-[#d4d4b8]">
              <input
                name="search"
                aria-label="Search components"
                placeholder="Search parts"
                className="h-11 min-w-0 flex-1 bg-white px-3 text-sm outline-none"
              />
              <button className="bg-[#1CA2D1] px-4 text-sm font-bold text-white">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <Link
              href="/components"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-zinc-800 hover:text-zinc-950"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Cpu className="h-4 w-4" />
              Components
            </Link>
            <Link
              href="/categories"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-zinc-800 hover:text-zinc-950"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Menu className="h-5 w-5" />
              All Categories
            </Link>
            <div className="rounded-md border border-[#d4d4b8] bg-white p-3">
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#1CA2D1]">
                Category tree
              </p>
              <div className="grid gap-2">
                {catalogNavigationGroups.slice(0, 5).map((group) => (
                  <Link
                    key={group.name}
                    href={group.href}
                    className="rounded-md bg-[#F5F5DC] px-3 py-2 text-sm font-bold text-zinc-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {group.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/robomaniac-store"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-zinc-800 hover:text-zinc-950"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingBag className="h-4 w-4" />
              Robomaniac Store
            </Link>
            <Link
              href="/projects"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-zinc-800 hover:text-zinc-950"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Wrench className="h-4 w-4" />
              Projects
            </Link>
            <Link
              href="/projects?difficulty=BEGINNER"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-zinc-800 hover:text-zinc-950"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PackageCheck className="h-4 w-4" />
              Starter Builds
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-zinc-800 hover:text-zinc-950"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
            </Link>

            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full border-[#d4d4b8]">
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="block">
                  <Button className="w-full bg-[#1CA2D1] text-white">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function CatalogMegaMenu({ align = "left" }: { align?: "left" | "wide" }) {
  return (
    <div
      className={`invisible absolute top-full z-50 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 ${
        align === "wide" ? "-left-72" : "left-0"
      }`}
    >
      <div className="w-[960px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#d4d4b8] bg-white shadow-2xl shadow-zinc-200/60">

        {/* Header strip */}
        <div className="flex items-center justify-between border-b border-[#d4d4b8] bg-[#F5F5DC] px-6 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.20em] text-[#1CA2D1]">
              Browse Catalog
            </p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-600">
              Categories, subcategories, and Robomaniac products.
            </p>
          </div>
          <Link
            href="/categories"
            className="btn-underline-white rounded-xl bg-[#1CA2D1] px-5 py-2.5 text-xs font-black text-white transition hover:opacity-90"
          >
            View All
          </Link>
        </div>

        {/* Category grid */}
        <div className="grid gap-6 p-6 md:grid-cols-4">
          {catalogNavigationGroups.map((group, idx) => (
            <div key={group.name}>
              <Link href={group.href} className="group/cat flex items-center gap-2 pb-0.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1CA2D1]/15 text-[9px] font-black text-[#1CA2D1]">
                  {idx + 1}
                </span>
                <span className="text-sm font-black text-zinc-950 transition-colors group-hover/cat:text-[#1CA2D1]">
                  {group.name}
                </span>
              </Link>
              <p className="mb-3 pl-7 text-[11px] font-medium leading-4 text-zinc-400">
                {group.description}
              </p>
              <div className="space-y-0.5 pl-1">
                {group.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.name}
                    href={subcategory.href}
                    className="block rounded-lg px-3 py-1.5 text-[11.5px] font-semibold text-zinc-600 transition-all hover:bg-[#1CA2D1]/10 hover:text-[#1CA2D1]"
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer quick-links */}
        <div className="flex items-center justify-between border-t border-[#d4d4b8] bg-[#F5F5DC]/80 px-6 py-3">
          <div className="flex items-center gap-5 text-[11px] font-bold text-zinc-500">
            <Link href="/components?isBestSeller=true" className="transition-colors hover:text-[#1CA2D1]">
              ↗ Best Sellers
            </Link>
            <Link href="/projects" className="transition-colors hover:text-[#1CA2D1]">
              ↗ Projects
            </Link>
            <Link href="/robomaniac-store" className="transition-colors hover:text-[#1CA2D1]">
              ↗ Robomaniac Store
            </Link>
            <Link href="/components?difficulty=BEGINNER" className="transition-colors hover:text-[#1CA2D1]">
              ↗ Starter Builds
            </Link>
          </div>
          <span className="text-[10px] font-semibold text-zinc-400">
            8 categories · 32+ subcategories
          </span>
        </div>
      </div>
    </div>
  );
}
