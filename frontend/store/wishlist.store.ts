import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Component } from "@/types/marketplace.types";
import { isAuthenticated } from "@/store/user.store";
import { addWishlistItem, removeWishlistItem } from "@/features/wishlist/services/wishlist.service";

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
          if (isAuthenticated()) addWishlistItem(component.id).catch(() => null);
          return { items: [...state.items, component] };
        });
      },

      removeItem: (componentId) => {
        if (isAuthenticated()) removeWishlistItem(componentId).catch(() => null);
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
