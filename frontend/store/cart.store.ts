import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Component, CartItem } from '@/types/marketplace.types';
import { isAuthenticated } from '@/store/user.store';
import { clearCartItems, removeCartItem, syncCartItems, upsertCartItem } from '@/features/cart/services/cart.service';

// ─── Store ────────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];

  addItem: (component: Component, quantity?: number) => void;
  removeItem: (componentId: string) => void;
  updateQuantity: (componentId: string, quantity: number) => void;
  clearCart: () => void;

  // Called after login — pushes local guest cart to server
  syncToServer: () => Promise<void>;

  getTotalItems: () => number;
  getSubtotal: () => number;
  getItemQuantity: (componentId: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (component: Component, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.component.id === component.id);

          if (existing) {
            const newQty = existing.quantity + quantity;
            if (newQty > component.stockQuantity) return state;
            const updated = state.items.map((i) =>
              i.component.id === component.id ? { ...i, quantity: newQty } : i,
            );
            if (isAuthenticated()) upsertCartItem(component.id, newQty).catch(() => null);
            return { items: updated };
          }

          if (quantity > component.stockQuantity) return state;
          const added = [...state.items, { component, quantity }];
          if (isAuthenticated()) upsertCartItem(component.id, quantity).catch(() => null);
          return { items: added };
        });
      },

      removeItem: (componentId: string) => {
        set((state) => {
          if (isAuthenticated()) removeCartItem(componentId).catch(() => null);
          return { items: state.items.filter((i) => i.component.id !== componentId) };
        });
      },

      updateQuantity: (componentId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(componentId);
          return;
        }
        set((state) => {
          const item = state.items.find((i) => i.component.id === componentId);
          if (!item) return state;
          if (quantity > item.component.stockQuantity) return state;
          if (isAuthenticated()) upsertCartItem(componentId, quantity).catch(() => null);
          return {
            items: state.items.map((i) =>
              i.component.id === componentId ? { ...i, quantity } : i,
            ),
          };
        });
      },

      clearCart: () => {
        if (isAuthenticated()) clearCartItems().catch(() => null);
        set({ items: [] });
      },

      syncToServer: async () => {
        const { items } = get();
        if (!isAuthenticated()) return;
        await syncCartItems(items).catch(() => null);
      },

      getTotalItems: () => get().items.reduce((t, i) => t + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((t, i) => t + i.component.unitPriceCents * i.quantity, 0),

      getItemQuantity: (componentId: string) =>
        get().items.find((i) => i.component.id === componentId)?.quantity ?? 0,
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const formatPrice = (cents: number): string => `₹${(cents / 100).toFixed(2)}`;
export const getCartItemCount = () => useCartStore.getState().getTotalItems();
export const getCartSubtotal = () => useCartStore.getState().getSubtotal();
