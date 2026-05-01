/**
 * Shopping Cart Store (Zustand)
 * 
 * Features:
 * - Add/remove/update items
 * - Persistent storage (localStorage)
 * - Automatic total calculation
 * - Stock validation
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Component, CartItem } from '@/lib/types/marketplace.types';

interface CartState {
  items: CartItem[];
  
  // Actions
  addItem: (component: Component, quantity?: number) => void;
  removeItem: (componentId: string) => void;
  updateQuantity: (componentId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Computed values
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
          const existingItem = state.items.find(
            (item) => item.component.id === component.id
          );

          if (existingItem) {
            // Update quantity if item exists
            const newQuantity = existingItem.quantity + quantity;
            
            // Check stock
            if (newQuantity > component.stockQuantity) {
              // Don't add more than available stock
              return state;
            }

            return {
              items: state.items.map((item) =>
                item.component.id === component.id
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            };
          }

          // Check stock for new item
          if (quantity > component.stockQuantity) {
            return state;
          }

          // Add new item
          return {
            items: [...state.items, { component, quantity }],
          };
        });
      },

      removeItem: (componentId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.component.id !== componentId),
        }));
      },

      updateQuantity: (componentId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(componentId);
          return;
        }

        set((state) => {
          const item = state.items.find((item) => item.component.id === componentId);
          
          if (!item) return state;

          // Check stock
          if (quantity > item.component.stockQuantity) {
            return state;
          }

          return {
            items: state.items.map((item) =>
              item.component.id === componentId
                ? { ...item, quantity }
                : item
            ),
          };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => total + item.component.unitPriceCents * item.quantity,
          0
        );
      },

      getItemQuantity: (componentId: string) => {
        const state = get();
        const item = state.items.find((item) => item.component.id === componentId);
        return item?.quantity || 0;
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Helper functions
export const formatPrice = (cents: number): string => {
  return `₹${(cents / 100).toFixed(2)}`;
};

export const getCartItemCount = () => useCartStore.getState().getTotalItems();
export const getCartSubtotal = () => useCartStore.getState().getSubtotal();
