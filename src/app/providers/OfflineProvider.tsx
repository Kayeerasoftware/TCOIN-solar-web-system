import { useEffect, type ReactNode } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { syncNow } from '@/offline/sync';
import { useAuthStore } from '@/store/authStore';

/** When the device comes back online and a technician is signed in, push queued work and pull changes. */
export function OfflineProvider({ children }: { children: ReactNode }) {
  const online = useOnlineStatus();
  const canSync = useAuthStore((s) => s.hasPermission('field.execute'));
  useEffect(() => { if (online && canSync) void syncNow().catch(() => undefined); }, [online, canSync]);
  return <>{children}</>;
}
