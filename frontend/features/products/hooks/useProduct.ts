"use client";

import { useQuery } from "@tanstack/react-query";
import { componentApi } from "@/features/products/services/product.service";

export function useProduct(componentId: string) {
  return useQuery({
    queryKey: ["component", componentId],
    queryFn: () => componentApi.getComponentById(componentId),
    enabled: Boolean(componentId),
  });
}
