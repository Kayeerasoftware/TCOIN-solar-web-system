import { api } from '@/api/client';
import type { CompanyProfile } from '@/types/domain';

export const getCompanyProfile = () => api.get<CompanyProfile>('/company-profile').then((r) => r.data);
export const amountInWordsApi = (amount: number, currency = 'UGX') =>
  api.get<{ words: string }>('/amount-in-words', { params: { amount, currency } }).then((r) => r.data.words);
export const verifyDocument = (code: string) => api.get(`/documents/verify/${code}`).then((r) => r.data);
