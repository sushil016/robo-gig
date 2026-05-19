"use client";

import { toast } from "sonner";
import type { Component } from "@/lib/types/marketplace.types";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { ProductRevealCard } from "@/components/ui/product-reveal-card";

type ProductCardProps = {
  component: Component;
};

export function ProductCard({ component }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(component.id));

  function handleAddToCart(c: Component, qty = 1) {
    if (c.stockQuantity === 0) {
      toast.error("Out of stock");
      return;
    }
    addItem(c, qty);
    toast.success("Added to cart", { description: c.name });
  }

  function handleToggleWishlist(c: Component) {
    const wasWishlisted = isWishlisted;
    toggleWishlist(c);
    toast.success(wasWishlisted ? "Removed from wishlist" : "Saved to wishlist");
  }

  return (
    <ProductRevealCard
      component={component}
      onAddToCart={handleAddToCart}
      onToggleWishlist={handleToggleWishlist}
      isWishlisted={isWishlisted}
    />
  );
}
