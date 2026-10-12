import { api, withIdempotency } from '@/api/client';
import type { ReceiptFormValues } from './schemas';

export const issueReceipt = (body: ReceiptFormValues) =>
  api.post('/receipts', { currency: 'UGX', ...body }, withIdempotency()).then((r) => r.data);
