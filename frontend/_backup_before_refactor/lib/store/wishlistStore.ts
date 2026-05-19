import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Component } from "@/lib/types/marketplace.types";
import { API_BASE_URL } from "@/lib/api/config";
import { isAuthenticated } from "@/lib/store/authStore";

// ─── Server API helpers ───────────────────────────────────────────────────────

async function serverAdd(componentId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/wishlist/items`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ componentId }),
  });
}

async function serverRemove(componentId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/wishlist/items/${componentId}`, {
    method: "DELETE",
    credentials: "include",
  });
}

// ─── Store ────────────────────────────────────────────────────────────────────

type WishlistState = {
  items: Component[];
  addItem: (component: Component) => void;
  removeItem: (componentId: string) => void;
  toggleItem: (component: Component) => void;
  clearWishlist: () => void;
  isWishlisted: (componentId: string) => boolean;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (component) => {
        set((state) => {
          if (state.items.some((item) => item.id === component.id)) return state;
          if (isAuthenticated()) serverAdd(component.id).catch(() => null);
          return { items: [...state.items, component] };
        });
      },

      removeItem: (componentId) => {
        if (isAuthenticated()) serverRemove(componentId).catch(() => null);
        set((state) => ({ items: state.items.filter((item) => item.id !== componentId) }));
      },

      toggleItem: (component) => {
        if (get().isWishlisted(component.id)) {
          get().removeItem(component.id);
        } else {
          get().addItem(component);
        }
      },

      clearWishlist: () => set({ items: [] }),

      isWishlisted: (componentId) => get().items.some((item) => item.id === componentId),
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
