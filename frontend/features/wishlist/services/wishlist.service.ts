import apiClient from "@/lib/api-client";

export async function addWishlistItem(componentId: string): Promise<void> {
  await apiClient.post("/api/wishlist/items", { componentId });
}

export async function removeWishlistItem(componentId: string): Promise<void> {
  await apiClient.delete(`/api/wishlist/items/${componentId}`);
}
