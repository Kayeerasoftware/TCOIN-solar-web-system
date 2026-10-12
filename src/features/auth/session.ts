import { me, type TokenResponse } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/authStore';
import type { AuthUser } from '@/types/domain';

/** Stores the tokens, loads the user, and returns it. Call after any successful sign-in step. */
export async function completeLogin(t: TokenResponse): Promise<AuthUser> {
  const { setTokens, setSession } = useAuthStore.getState();
  setTokens(t.access_token, t.refresh_token);
  const user = await me();
  setSession(user, t.access_token, t.refresh_token);
  return user;
}

/** Where to send a user after signing in: the page they asked for, else their own area. */
export function homeFor(user: AuthUser, from?: string): string {
  if (from && from !== '/login') return from;
  if (user.user_type === 'customer') return '/portal';
  if (user.roles.includes('technician')) return '/field';
  return '/console';
}
