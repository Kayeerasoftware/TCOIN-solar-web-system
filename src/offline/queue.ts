import { db, type QueuedMutation } from './db';

/** Queue a change made offline. The client_uuid makes the server apply it at most once. */
export async function enqueue(type: string, payload: unknown): Promise<QueuedMutation> {
  const m: QueuedMutation = { client_uuid: crypto.randomUUID(), type, payload, device_time: new Date().toISOString(), status: 'pending', attempts: 0 };
  await db.mutations.add(m);
  return m;
}
export const pending = () => db.mutations.where('status').anyOf('pending', 'failed').toArray();
export const markApplied = (id: string) => db.mutations.update(id, { status: 'applied' });
export const markFailed = (id: string, reason: string) =>
  db.mutations.where('client_uuid').equals(id).modify((m) => { m.status = 'failed'; m.reason = reason; m.attempts += 1; });
