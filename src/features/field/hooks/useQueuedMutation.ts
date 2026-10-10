import { enqueue } from '@/offline/queue';

/** Technician actions always go through the offline queue; the sync engine sends them when online. */
export function useQueuedMutation(type: string) {
  return (payload: unknown) => enqueue(type, payload);
}
