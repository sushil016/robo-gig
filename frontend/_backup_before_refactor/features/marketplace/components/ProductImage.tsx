/* eslint-disable @next/next/no-img-element */

import { Package } from "lucide-react";
import { productImageUrl } from "../lib/catalog";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
};

export function ProductImage({
  src,
  alt,
  className = "",
  imageClassName = "",
}: ProductImageProps) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 ${className}`}>
        <Package className="h-12 w-12 text-slate-400" />
      </div>
    );
  }

  return (
    <div className={`overflow-hidden bg-white ${className}`}>
      <img
        src={productImageUrl({ imageUrl: src })}
        alt={alt}
        className={`h-full w-full ${imageClassName}`}
        loading="lazy"
      />
    </div>
  );
}
