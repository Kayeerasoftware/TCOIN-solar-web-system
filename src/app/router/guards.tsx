import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { NotPermitted } from '@/components/feedback/NotPermitted';
import type { UserType } from '@/types/domain';

interface Props {
  children: ReactNode;
  userType?: UserType;
  permission?: string;
}

/** Sends anonymous visitors to the login page and blocks users who lack the role or permission. */
export function RequireAuth({ children, userType, permission }: Props) {
  const { user, hasPermission } = useAuthStore();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (userType && user.user_type !== userType) return <NotPermitted />;
  if (permission && !hasPermission(permission)) return <NotPermitted />;
  return <>{children}</>;
}

/** For login pages: signed-in users go straight to their own area. */
export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to={user.user_type === 'customer' ? '/portal' : '/console'} replace />;
  return <>{children}</>;
}
