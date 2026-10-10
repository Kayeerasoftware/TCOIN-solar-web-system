import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartLine { variant_id: string; sku: string; name: string; unit_price: number; quantity: number }
interface CartState {
  lines: CartLine[];
  add: (line: CartLine) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) => set((s) => {
        const hit = s.lines.find((l) => l.variant_id === line.variant_id);
        return { lines: hit ? s.lines.map((l) => (l === hit ? { ...l, quantity: l.quantity + line.quantity } : l)) : [...s.lines, line] };
      }),
      setQuantity: (id, q) => set((s) => ({ lines: s.lines.map((l) => (l.variant_id === id ? { ...l, quantity: Math.max(1, q) } : l)) })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.variant_id !== id) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'tcoin.cart' },
  ),
);
