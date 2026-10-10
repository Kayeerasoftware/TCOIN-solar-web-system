import { http, HttpResponse } from 'msw';
import { env } from '@/lib/env';
import { FALLBACK_PROFILE } from '@/config/companyProfile';

const base = env.VITE_API_URL;

export const handlers = [
  http.get(`${base}/company-profile`, () => HttpResponse.json(FALLBACK_PROFILE)),
  http.get(`${base}/amount-in-words`, () => HttpResponse.json({ words: 'Two million nine hundred thousand shillings only' })),
  // Add handlers per API area as screens are built (fixtures in ./fixtures).
];
