"use client";

import { useQuery } from "@tanstack/react-query";
import { addressApi } from "@/features/user/services/address.service";

export function useAddresses(enabled = true) {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.list(),
    enabled,
  });
}
