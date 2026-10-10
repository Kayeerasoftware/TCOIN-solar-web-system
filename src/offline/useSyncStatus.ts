import { useLiveQuery } from 'dexie-react-hooks';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { db } from './db';

/** What the technician sees in the banner: connection state and how many changes are waiting. */
export function useSyncStatus() {
  const online = useOnlineStatus();
  const waiting = useLiveQuery(() => db.mutations.where('status').equals('pending').count(), [], 0);
  const failed = useLiveQuery(() => db.mutations.where('status').equals('failed').count(), [], 0);
  return { online, waiting, failed };
}
