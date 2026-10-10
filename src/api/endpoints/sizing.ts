import { api } from '@/api/client';

export const indicativeEstimate = (body: unknown) => api.post('/public/sizing/estimate', body).then((r) => r.data);
export const calculate = (body: unknown) => api.post('/sizing/calculate', body).then((r) => r.data);
