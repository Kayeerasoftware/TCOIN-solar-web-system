import { api } from '@/api/client';
import { db } from './db';
import { markApplied, markFailed, pending } from './queue';

async function deviceId(): Promise<string> {
  const row = await db.meta.get('device_id');
  if (row) return row.value as string;
  const id = crypto.randomUUID();
  await db.meta.put({ key: 'device_id', value: id });
  return id;
}

interface PushResult { client_uuid: string; status: 'applied' | 'duplicate' | 'rejected'; reason?: string }

/** Push queued changes, then pull everything changed since the stored cursor. Safe to call repeatedly. */
export async function syncNow(): Promise<{ pushed: number; rejected: number }> {
  const device_id = await deviceId();
  const queued = await pending();
  let rejected = 0;
  if (queued.length) {
    const { data } = await api.post<{ results: PushResult[] }>('/sync/push', {
      device_id,
      mutations: queued.map(({ client_uuid, type, payload, device_time }) => ({ client_uuid, type, payload, device_time })),
    });
    for (const r of data.results) {
      if (r.status === 'rejected') { rejected += 1; await markFailed(r.client_uuid, r.reason ?? 'Rejected'); }
      else await markApplied(r.client_uuid);
    }
  }
  let cursor = ((await db.meta.get('cursor'))?.value as number | undefined) ?? 0;
  for (;;) {
    const { data } = await api.get<{ cursor: number; has_more: boolean; changes: Record<string, { id: string; rev?: number }[]> }>('/sync/pull', { params: { cursor, device_id } });
    for (const [collection, rows] of Object.entries(data.changes ?? {})) {
      if (!Array.isArray(rows)) continue;
      await db.records.bulkPut(rows.map((row) => ({ key: `${collection}:${row.id}`, collection, data: row, rev: row.rev ?? data.cursor })));
    }
    cursor = data.cursor;
    await db.meta.put({ key: 'cursor', value: cursor });
    if (!data.has_more) break;
  }
  return { pushed: queued.length - rejected, rejected };
}
