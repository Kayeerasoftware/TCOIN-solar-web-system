import { useEffect, useState, type ReactNode } from 'react';
import { me } from '@/api/endpoints/auth';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useAuthStore } from '@/store/authStore';

/** On load, restores the session from the refresh token (kept in sessionStorage) before rendering routes. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { refreshToken, setSession, clear, accessToken } = useAuthStore.getState();
    if (!refreshToken && !accessToken) { setReady(true); return; }
    me().then((user) => setSession(user, useAuthStore.getState().accessToken ?? '', useAuthStore.getState().refreshToken ?? ''))
      .catch(() => clear())
      .finally(() => setReady(true));
  }, []);
  return ready ? <>{children}</> : <LoadingState />;
}
