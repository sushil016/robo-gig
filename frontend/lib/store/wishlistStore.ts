import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Component } from "@/lib/types/marketplace.types";

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
          if (state.items.some((item) => item.id === component.id)) {
            return state;
          }

          return { items: [...state.items, component] };
        });
      },
      removeItem: (componentId) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== componentId) }));
      },
      toggleItem: (component) => {
        const exists = get().isWishlisted(component.id);

        if (exists) {
          get().removeItem(component.id);
          return;
        }

        get().addItem(component);
      },
      clearWishlist: () => set({ items: [] }),
      isWishlisted: (componentId) => get().items.some((item) => item.id === componentId),
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
