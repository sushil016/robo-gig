import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Component, CartItem } from '@/lib/types/marketplace.types';
import { API_BASE_URL } from '@/lib/api/config';
import { isAuthenticated } from '@/lib/store/authStore';

// ─── Server API helpers ───────────────────────────────────────────────────────

async function serverUpsert(componentId: string, quantity: number): Promise<void> {
  await fetch(`${API_BASE_URL}/api/cart/items`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ componentId, quantity }),
  });
}

async function serverRemove(componentId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/cart/items/${componentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

async function serverClear(): Promise<void> {
  await fetch(`${API_BASE_URL}/api/cart`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

async function serverSync(items: CartItem[]): Promise<void> {
  await fetch(`${API_BASE_URL}/api/cart/sync`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map((i) => ({ componentId: i.component.id, quantity: i.quantity })),
    }),
  });
}

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
            if (isAuthenticated()) serverUpsert(component.id, newQty).catch(() => null);
            return { items: updated };
          }

          if (quantity > component.stockQuantity) return state;
          const added = [...state.items, { component, quantity }];
          if (isAuthenticated()) serverUpsert(component.id, quantity).catch(() => null);
          return { items: added };
        });
      },

      removeItem: (componentId: string) => {
        set((state) => {
          if (isAuthenticated()) serverRemove(componentId).catch(() => null);
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
          if (isAuthenticated()) serverUpsert(componentId, quantity).catch(() => null);
          return {
            items: state.items.map((i) =>
              i.component.id === componentId ? { ...i, quantity } : i,
            ),
          };
        });
      },

      clearCart: () => {
        if (isAuthenticated()) serverClear().catch(() => null);
        set({ items: [] });
      },

      syncToServer: async () => {
        const { items } = get();
        if (!isAuthenticated()) return;
        await serverSync(items).catch(() => null);
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
