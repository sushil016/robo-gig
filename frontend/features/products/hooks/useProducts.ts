"use client";

import { useQuery } from "@tanstack/react-query";
import { componentApi } from "@/features/products/services/product.service";
import type { ComponentFilters } from "@/types/marketplace.types";

export function useProducts(filters?: ComponentFilters) {
  return useQuery({
    queryKey: ["components", filters],
    queryFn: () => componentApi.getComponents(filters),
  });
}
