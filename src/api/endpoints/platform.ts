import { api } from '@/api/client';
import type { ReportSummary } from '@/types/api';

export const getSummary = () => api.get<ReportSummary>('/reports/summary').then((r) => r.data);
