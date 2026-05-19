import apiClient from "@/lib/api-client";
import type { CartItem } from "@/types/marketplace.types";

export async function upsertCartItem(componentId: string, quantity: number): Promise<void> {
  await apiClient.put("/api/cart/items", { componentId, quantity });
}

export async function removeCartItem(componentId: string): Promise<void> {
  await apiClient.delete(`/api/cart/items/${componentId}`);
}

export async function clearCartItems(): Promise<void> {
  await apiClient.delete("/api/cart");
}

export async function syncCartItems(items: CartItem[]): Promise<void> {
  await apiClient.post("/api/cart/sync", {
    items: items.map((item) => ({ componentId: item.component.id, quantity: item.quantity })),
  });
}
