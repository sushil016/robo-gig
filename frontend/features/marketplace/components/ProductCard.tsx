"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import type { Component } from "@/lib/types/marketplace.types";
import { formatPrice, useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { toast } from "sonner";
import { ProductImage } from "./ProductImage";

type ProductCardProps = {
  component: Component;
};

export function ProductCard({ component }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const itemQuantity = useCartStore((state) => state.getItemQuantity(component.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(component.id));
  const isOutOfStock = component.stockQuantity === 0;
  const isLowStock = component.stockQuantity > 0 && component.stockQuantity <= 10;

  function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isOutOfStock) {
      toast.error("Out of stock");
      return;
    }

    addItem(component, 1);
    toast.success("Added to cart", {
      description: component.name,
    });
  }

  return (
    <Link href={`/components/${component.id}`} className="group text-center">
      <article className="h-full rounded-md border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-md">
        <div className="relative mx-auto aspect-square max-w-56">
          <button
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleWishlist(component);
              toast.success(isWishlisted ? "Removed from wishlist" : "Saved to wishlist");
            }}
            className={`absolute bottom-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow ${
              isWishlisted ? "bg-blue-700 text-white" : "bg-white text-slate-700"
            }`}
            aria-label="Toggle wishlist"
          >
            <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          {component.isBestSeller && (
            <span className="absolute right-2 top-2 z-10 bg-blue-600 px-2 py-1 text-xs font-black text-white">
              Best
            </span>
          )}
          {isLowStock && (
            <span className="absolute left-2 top-2 z-10 bg-amber-500 px-2 py-1 text-xs font-black text-white">
              Low stock
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute left-2 top-2 z-10 bg-red-600 px-2 py-1 text-xs font-black text-white">
              Sold out
            </span>
          )}
          <ProductImage
            src={component.imageUrl}
            alt={component.name}
            className="h-full w-full rounded-md"
            imageClassName="object-contain transition group-hover:scale-105"
          />
        </div>

        <h3 className="mt-4 line-clamp-2 min-h-12 text-sm font-black leading-6 text-slate-800">
          {component.name}
        </h3>
        <p className="mt-1 text-xs font-bold text-slate-400">
          {component.brand || component.subcategory || component.category}
        </p>
        <p className="mt-2 text-lg font-black text-blue-700">
          {formatPrice(component.unitPriceCents)}
        </p>
        <p className="mt-1 text-xs font-black text-emerald-700">Inc. GST</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          {isOutOfStock ? "Out of stock" : `${component.stockQuantity} in stock`}
        </p>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-black text-white transition hover:bg-blue-800 disabled:bg-slate-300"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {itemQuantity > 0 ? `In Cart (${itemQuantity})` : "Add to Cart"}
        </button>
      </article>
    </Link>
  );
}
