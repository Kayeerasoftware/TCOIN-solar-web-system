import Dexie, { type Table } from 'dexie';

export interface QueuedMutation {
  client_uuid: string;
  type: string; // task.update, checklist.answer, parts.use, note.add, photo.attach, work_order.complete, delivery.complete ...
  payload: unknown;
  device_time: string;
  status: 'pending' | 'failed' | 'applied';
  reason?: string;
  attempts: number;
}
export interface CachedRecord { key: string; collection: string; data: unknown; rev: number }
export interface MetaRow { key: string; value: unknown }

class FieldDb extends Dexie {
  mutations!: Table<QueuedMutation, string>;
  records!: Table<CachedRecord, string>;
  meta!: Table<MetaRow, string>;
  constructor() {
    super('tcoin_field');
    this.version(1).stores({ mutations: 'client_uuid, status, type', records: 'key, collection', meta: 'key' });
  }
}

export const db = new FieldDb();
