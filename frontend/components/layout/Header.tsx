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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white text-slate-950">
      <div className="bg-blue-700 px-4 py-2 text-center text-sm font-medium text-white">
        Electronics components, custom projects, Robomaniac kits, books, and BlockSquare software.
      </div>

      <div className="border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <a
            href="mailto:support@roboroot.in"
            className="hidden items-center gap-2 text-sm font-semibold text-slate-700 sm:flex"
          >
            <Mail className="h-4 w-4" />
            support@roboroot.in
          </a>

          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-cyan-500 bg-white text-2xl font-black text-blue-700">
              R
            </span>
            <span className="leading-none">
              <span className="block text-2xl font-black tracking-wide text-blue-700">
                ROBO<span className="text-cyan-600">ROOT</span>
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Ideas, Parts, Builds
              </span>
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center px-4 lg:flex">
            <form action="/components" className="flex w-full max-w-xl overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
              <div className="flex flex-1 items-center gap-2 px-4">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  name="search"
                  aria-label="Search components"
                  placeholder="Search Arduino, ESP32, sensors..."
                  className="h-12 w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                />
              </div>
              <button className="h-12 bg-blue-700 px-7 text-sm font-bold text-white transition hover:bg-blue-800">
                Search
              </button>
            </form>
          </div>

          <div className="flex items-center gap-1">
            <Link href="/components" className="hidden md:block">
              <Button variant="ghost" size="icon" aria-label="Components">
                <Cpu className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/projects" className="hidden md:block">
              <Button variant="ghost" size="icon" aria-label="Projects">
                <BookOpen className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" aria-label="Wishlist" className="hidden md:inline-flex">
              <Heart className="h-5 w-5" />
            </Button>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            {isAuthenticated && user ? (
              <UserMenu user={user} />
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button variant="ghost" size="icon" aria-label="Login">
                  <UserRound className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-slate-200 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <nav className="flex h-14 items-center text-sm font-bold text-slate-800">
            <div className="group relative flex h-full items-center">
              <Link href="/categories" className="flex h-full items-center gap-2 bg-blue-50 px-5 text-blue-800 transition hover:bg-blue-100">
                <Menu className="h-5 w-5" />
                All Categories
                <ChevronDown className="h-4 w-4" />
              </Link>
              <CatalogMegaMenu />
            </div>
            <Link href="/" className="flex h-full items-center px-5 text-blue-700 transition hover:bg-blue-50">
              Home
            </Link>
            <Link href="/projects" className="flex h-full items-center px-5 transition hover:bg-blue-50 hover:text-blue-700">
              Projects
            </Link>
            <div className="group relative flex h-full items-center">
              <Link href="/components" className="flex h-full items-center gap-1 px-5 transition hover:bg-blue-50 hover:text-blue-700">
                Shop Parts
                <ChevronDown className="h-4 w-4" />
              </Link>
              <CatalogMegaMenu align="wide" />
            </div>
            <Link href="/categories" className="flex h-full items-center px-5 transition hover:bg-blue-50 hover:text-blue-700">
              Categories
            </Link>
            <Link href="/projects?difficulty=BEGINNER" className="flex h-full items-center px-5 transition hover:bg-blue-50 hover:text-blue-700">
              Starter Builds
            </Link>
            <Link href="/robomaniac-store" className="flex h-full items-center px-5 transition hover:bg-blue-50 hover:text-blue-700">
              Robomaniac Store
            </Link>
            <Link href="/projects?category=ROBOTICS" className="flex h-full items-center px-5 transition hover:bg-blue-50 hover:text-blue-700">
              Robotics Kits
            </Link>
          </nav>
          <Link href="/components" className="flex h-14 items-center gap-2 border-x border-slate-200 bg-blue-50 px-5 text-sm font-bold text-blue-900 transition hover:bg-blue-100">
            <ShoppingBag className="h-5 w-5" />
            Browse Store
          </Link>
        </div>
      </div>

      <div className="lg:hidden">
        {mobileMenuOpen && (
          <div className="space-y-2 border-t bg-white px-4 py-4">
            <form action="/components" className="flex overflow-hidden rounded-md border border-slate-300">
              <input
                name="search"
                aria-label="Search components"
                placeholder="Search parts"
                className="h-11 min-w-0 flex-1 px-3 text-sm outline-none"
              />
              <button className="bg-blue-700 px-4 text-sm font-bold text-white">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <Link
              href="/components"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Cpu className="h-4 w-4" />
              Components
            </Link>
            <Link
              href="/categories"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Menu className="h-5 w-5" />
              All Categories
            </Link>
            <div className="rounded-md border border-blue-100 bg-blue-50 p-3">
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-blue-700">
                Category tree
              </p>
              <div className="grid gap-2">
                {catalogNavigationGroups.slice(0, 5).map((group) => (
                  <Link
                    key={group.name}
                    href={group.href}
                    className="rounded-md bg-white px-3 py-2 text-sm font-bold text-slate-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {group.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/robomaniac-store"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingBag className="h-4 w-4" />
              Robomaniac Store
            </Link>
            <Link
              href="/projects"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Wrench className="h-4 w-4" />
              Projects
            </Link>
            <Link
              href="/projects?difficulty=BEGINNER"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PackageCheck className="h-4 w-4" />
              Starter Builds
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
            </Link>

            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="block">
                  <Button className="w-full">Sign Up</Button>
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
      className={`invisible absolute top-full z-50 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 ${
        align === "wide" ? "-left-72" : "left-0"
      }`}
    >
      <div className="w-[900px] max-w-[calc(100vw-2rem)] rounded-lg border border-blue-100 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
              Browse Catalog
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Categories, subcategories, and Robomaniac products.
            </p>
          </div>
          <Link href="/categories" className="rounded-md bg-blue-700 px-4 py-2 text-xs font-black text-white hover:bg-blue-800">
            View All
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {catalogNavigationGroups.map((group) => (
            <div key={group.name}>
              <Link href={group.href} className="text-sm font-black text-slate-950 hover:text-blue-700">
                {group.name}
              </Link>
              <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-slate-500">
                {group.description}
              </p>
              <div className="mt-3 space-y-2">
                {group.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.name}
                    href={subcategory.href}
                    className="block text-xs font-bold text-slate-600 hover:text-blue-700"
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
