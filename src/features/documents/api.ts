import { api, withIdempotency } from '@/api/client';
import type { ReceiptForm } from './schemas';

export const issueReceipt = (body: ReceiptForm) =>
  api
    .post('/receipts', { receipt_type: 'corporate', currency: 'UGX', ...body }, withIdempotency())
    .then((r) => r.data);
