"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Heart,
  Minus,
  Plus,
  Shield,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { componentApi } from "@/lib/api/marketplace.api";
import { formatPrice, useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { ProductImage } from "@/features/marketplace/components/ProductImage";
import { compactProductType } from "@/features/marketplace/lib/catalog";

export default function ComponentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const componentId = params.id as string;
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const itemQuantity = useCartStore((state) => state.getItemQuantity(componentId));
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(componentId));

  const { data: component, isLoading, error } = useQuery({
    queryKey: ["component", componentId],
    queryFn: () => componentApi.getComponentById(componentId),
    enabled: Boolean(componentId),
  });

  if (isLoading) {
    return <div className="px-4 py-20 text-center text-sm font-black text-slate-500">Loading product...</div>;
  }

  if (error || !component) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-3xl font-black">Component not found</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">This product may have been removed or archived.</p>
        <Link href="/components" className="mt-6 inline-flex rounded-md bg-blue-700 px-5 py-3 text-sm font-black text-white">
          Back to Components
        </Link>
      </div>
    );
  }

  const isOutOfStock = component.stockQuantity === 0;
  const maxQuantity = Math.min(component.stockQuantity, 99);

  function handleAddToCart() {
    if (!component) {
      return;
    }

    if (isOutOfStock) {
      toast.error("Out of stock");
      return;
    }

    if (quantity > component.stockQuantity) {
      toast.error(`Only ${component.stockQuantity} available`);
      return;
    }

    addItem(component, quantity);
    toast.success("Added to cart", {
      description: `${quantity} x ${component.name}`,
    });
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/cart");
  }

  return (
    <div className="bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <Link href="/components" className="inline-flex items-center text-sm font-black text-blue-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to catalog
          </Link>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Home / {component.category} / {component.subcategory}
          </p>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_480px]">
        <section>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <ProductImage
              src={component.imageUrl}
              alt={component.name}
              className="aspect-square rounded-md"
              imageClassName="object-contain"
            />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ["Quality checked", "All components inspected before dispatch."],
              ["Fast shipping", "Shipping across India with order tracking."],
              ["Project ready", "Useful for student, institution, and company builds."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-black">{title}</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                {compactProductType(component.productType)}
              </span>
              {component.isBestSeller && <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">Best seller</span>}
              {component.isRobomaniacItem && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">Robomaniac</span>}
            </div>
            <h1 className="text-3xl font-black leading-tight lg:text-4xl">{component.name}</h1>
            {component.sku && <p className="mt-2 text-sm font-semibold text-slate-500">SKU: {component.sku}</p>}
            <p className="mt-5 text-4xl font-black text-blue-700">{formatPrice(component.unitPriceCents)}</p>
            <p className="mt-1 text-sm font-black text-emerald-700">Inc. GST</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className={isOutOfStock ? "text-red-600" : "text-emerald-600"}>
              {isOutOfStock ? (
                <p className="font-black">Out of stock</p>
              ) : (
                <p className="flex items-center gap-2 font-black">
                  <Check className="h-5 w-5" />
                  In Stock ({component.stockQuantity} available)
                </p>
              )}
            </div>

            {!isOutOfStock && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-black">Quantity</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10 rounded-md border border-slate-300">
                    <Minus className="mx-auto h-4 w-4" />
                  </button>
                  <input
                    value={quantity}
                    onChange={(event) => setQuantity(Math.min(maxQuantity, Math.max(1, Number(event.target.value) || 1)))}
                    className="h-10 w-20 rounded-md border border-slate-300 text-center text-sm font-black"
                    type="number"
                    min="1"
                    max={maxQuantity}
                  />
                  <button onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))} className="h-10 w-10 rounded-md border border-slate-300">
                    <Plus className="mx-auto h-4 w-4" />
                  </button>
                  <span className="text-sm font-bold text-slate-500">
                    Total {formatPrice(component.unitPriceCents * quantity)}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="inline-flex h-12 items-center justify-center rounded-md bg-blue-700 text-sm font-black text-white disabled:bg-slate-300"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {itemQuantity > 0 ? `In Cart (${itemQuantity})` : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="h-12 rounded-md bg-slate-950 text-sm font-black text-white disabled:bg-slate-300"
              >
                Buy Now
              </button>
            </div>
            <button
              onClick={() => {
                toggleWishlist(component);
                toast.success(isWishlisted ? "Removed from wishlist" : "Saved to wishlist");
              }}
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-md border border-slate-300 text-sm font-black"
            >
              <Heart className="mr-2 h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
              {isWishlisted ? "Saved in Wishlist" : "Add to Wishlist"}
            </button>
          </div>

          {(component.description || component.typicalUseCase) && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">Product Details</h2>
              {component.description && <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{component.description}</p>}
              {component.typicalUseCase && (
                <div className="mt-5 rounded-md bg-blue-50 p-4">
                  <p className="text-sm font-black text-blue-800">Typical use</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-blue-900/70">{component.typicalUseCase}</p>
                </div>
              )}
              {component.vendorLink && (
                <a href={component.vendorLink} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center text-sm font-black text-blue-700">
                  View vendor details
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              )}
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-3 text-sm font-semibold text-slate-600">
              <p className="flex items-center gap-3"><Truck className="h-5 w-5 text-blue-700" /> Free shipping above ₹500</p>
              <p className="flex items-center gap-3"><Shield className="h-5 w-5 text-blue-700" /> Secure test checkout enabled</p>
              <p className="flex items-center gap-3"><Check className="h-5 w-5 text-blue-700" /> GST-ready order workflow foundation</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
