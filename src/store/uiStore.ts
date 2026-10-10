import { create } from 'zustand';

interface UiState { sidebarOpen: boolean; toggleSidebar: () => void; theme: 'light' | 'dark' | 'system'; setTheme: (t: UiState['theme']) => void }
export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}));
