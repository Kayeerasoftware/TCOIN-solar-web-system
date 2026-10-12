import { api } from '@/api/client';
import type { CompanyProfile } from '@/types/domain';

export const getCompanyProfile = () => api.get<CompanyProfile>('/company-profile').then((r) => r.data);
export const amountInWordsApi = (amount: number, currency = 'UGX') =>
  api.get<{ words: string }>('/amount-in-words', { params: { amount, currency } }).then((r) => r.data.words);
export const verifyDocument = (code: string) => api.get(`/documents/verify/${code}`).then((r) => r.data);

import { withIdempotency } from '@/api/client';
import type { Page, Receipt, ReceiptInput } from '@/types/api';

export const listReceipts = () => api.get<Page<Receipt>>('/receipts').then((r) => r.data.data);
export const getReceipt = (id: string) => api.get<Receipt>(`/receipts/${id}`).then((r) => r.data);
export const issueReceipt = (body: ReceiptInput) =>
  api.post<Receipt>('/receipts', body, withIdempotency()).then((r) => r.data);
