import { apiFetch } from "./client";
import type { CategoryNode } from "@/types";

export async function fetchCategoryTree(token?: string): Promise<CategoryNode[]> {
  const payload = await apiFetch<{ success: boolean; data: CategoryNode[] }>(
    "/api/components/categories/tree",
    token ? { token } : {},
  );
  return payload.data;
}
