import 'fake-indexeddb/auto';
import { db } from './db';
import { enqueue, markApplied, markFailed, pending } from './queue';

describe('offline queue', () => {
  beforeEach(async () => { await db.mutations.clear(); });
  it('queues changes with a unique client_uuid', async () => {
    const a = await enqueue('note.add', { text: 'a' });
    const b = await enqueue('note.add', { text: 'b' });
    expect(a.client_uuid).not.toBe(b.client_uuid);
    expect((await pending()).length).toBe(2);
  });
  it('keeps failed changes for review and drops applied ones from the pending list', async () => {
    const a = await enqueue('task.update', {});
    const b = await enqueue('parts.use', {});
    await markApplied(a.client_uuid);
    await markFailed(b.client_uuid, 'Status was changed by the office');
    const list = await pending();
    expect(list.map((m) => m.status)).toEqual(['failed']);
    expect(list[0].reason).toMatch(/office/);
  });
});
