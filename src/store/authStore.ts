import { create } from 'zustand';
import type { AuthUser } from '@/types/domain';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null; // kept in sessionStorage so a reload keeps the session
  setSession: (user: AuthUser, access: string, refresh: string) => void;
  setTokens: (access: string, refresh: string) => void;
  clear: () => void;
  hasPermission: (code: string) => boolean;
}

const RT = 'tcoin.rt';
const read = () => { try { return sessionStorage.getItem(RT); } catch { return null; } };
const write = (v: string | null) => { try { v ? sessionStorage.setItem(RT, v) : sessionStorage.removeItem(RT); } catch { /* ignore */ } };

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: read(),
  setSession: (user, access, refresh) => { write(refresh); set({ user, accessToken: access, refreshToken: refresh }); },
  setTokens: (access, refresh) => { write(refresh); set({ accessToken: access, refreshToken: refresh }); },
  clear: () => { write(null); set({ user: null, accessToken: null, refreshToken: null }); },
  hasPermission: (code) => !!get().user?.permissions.includes(code),
}));
