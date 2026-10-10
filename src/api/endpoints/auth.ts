import { api } from '@/api/client';
import type { AuthUser } from '@/types/domain';

export interface TokenResponse { access_token: string; refresh_token: string; expires_in: number; mfa_required?: boolean; mfa_token?: string }

export const login = (identifier: string, password: string, device_name?: string) =>
  api.post<TokenResponse>('/auth/login', { identifier, password, device_name }).then((r) => r.data);
export const requestOtp = (phone: string) => api.post('/auth/otp/request', { phone });
export const verifyOtp = (phone: string, code: string) => api.post<TokenResponse>('/auth/otp/verify', { phone, code }).then((r) => r.data);
export const verifyMfa = (mfa_token: string, code: string) => api.post<TokenResponse>('/auth/mfa/verify', { mfa_token, code }).then((r) => r.data);
export const logout = () => api.post('/auth/logout');
export const me = () => api.get<AuthUser>('/me').then((r) => r.data);
