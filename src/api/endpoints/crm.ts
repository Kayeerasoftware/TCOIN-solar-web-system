import { api } from '@/api/client';
import type { Customer, Lead, LeadStatus, Page } from '@/types/api';

export const listLeads = (status?: LeadStatus) =>
  api.get<Page<Lead>>('/leads', { params: { status } }).then((r) => r.data.data);
export const updateLead = (id: string, body: Partial<Pick<Lead, 'status'>>) =>
  api.patch<Lead>(`/leads/${id}`, body).then((r) => r.data);
export const listCustomers = () => api.get<Page<Customer>>('/customers').then((r) => r.data.data);

export interface LeadInput {
  full_name: string;
  phone?: string;
  email?: string;
  location?: string;
  service_interest?: string;
  message?: string;
  source_code?: string;
  calculator_input?: unknown;
  calculator_result?: unknown;
  consent_marketing?: boolean;
}
export const submitLead = (body: LeadInput) =>
  api.post<{ lead_no: string }>('/public/leads', body).then((r) => r.data);
