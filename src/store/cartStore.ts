import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useAuthStore } from './authStore';

export interface CartLine {
  variant_id: string;
  sku: string;
  name: string;
  unit_price: number;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  add: (line: CartLine) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
}

/** Returns a storage key scoped to the logged-in user, or null for guests. */
function storageKey(): string | null {
  const user = useAuthStore.getState().user;
  return user ? `tcoin.cart.${user.id}` : null;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) =>
        set((s) => {
          const hit = s.lines.find((l) => l.variant_id === line.variant_id);
          return {
            lines: hit
              ? s.lines.map((l) => (l === hit ? { ...l, quantity: l.quantity + line.quantity } : l))
              : [...s.lines, line],
          };
        }),
      setQuantity: (id, q) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.variant_id === id ? { ...l, quantity: Math.max(1, q) } : l)),
        })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.variant_id !== id) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: 'tcoin.cart',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const key = storageKey();
          if (!key) return null;
          return localStorage.getItem(`${name}.${key}`);
        },
        setItem: (name, value) => {
          const key = storageKey();
          if (!key) return; // guests: don't persist
          localStorage.setItem(`${name}.${key}`, value);
        },
        removeItem: (name) => {
          const key = storageKey();
          if (!key) return;
          localStorage.removeItem(`${name}.${key}`);
        },
      })),
    },
  ),
);
