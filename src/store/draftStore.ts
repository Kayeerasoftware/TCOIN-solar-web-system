import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Unsent form drafts (quote builder, letters, vouchers) survive a reload. */
interface DraftState { drafts: Record<string, unknown>; save: (key: string, value: unknown) => void; discard: (key: string) => void }
export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      drafts: {},
      save: (key, value) => set((s) => ({ drafts: { ...s.drafts, [key]: value } })),
      discard: (key) => set((s) => { const rest = { ...s.drafts }; delete rest[key]; return { drafts: rest }; }),
    }),
    { name: 'tcoin.drafts' },
  ),
);
