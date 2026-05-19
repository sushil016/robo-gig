"use client";

import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/features/products/services/product.service";

export function useOrders(enabled = true) {
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: () => orderApi.getMyOrders(),
    enabled,
  });
}
