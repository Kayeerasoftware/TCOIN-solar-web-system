import { api, withIdempotency } from '@/api/client';
import type { Page, ProformaResult, Quote, QuoteInput } from '@/types/api';

export const listQuotes = () => api.get<Page<Quote>>('/quotes').then((r) => r.data.data);
export const getQuote = (id: string) => api.get<Quote>(`/quotes/${id}`).then((r) => r.data);
export const createQuote = (body: QuoteInput) => api.post<Quote>('/quotes', body).then((r) => r.data);
/** Saves the quote as a new version (a sent version is frozen on the server). */
export const saveQuoteVersion = (id: string, body: QuoteInput) =>
  api.post<Quote>(`/quotes/${id}/versions`, body).then((r) => r.data);
export const issueProforma = (id: string) =>
  api.post<ProformaResult>(`/quotes/${id}/proforma`, {}, withIdempotency()).then((r) => r.data);
