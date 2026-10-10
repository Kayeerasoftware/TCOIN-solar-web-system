import { api } from '@/api/client';

export const listProducts = (params?: Record<string, unknown>) => api.get('/catalog/products', { params }).then((r) => r.data);
export const getProduct = (id: string) => api.get(`/catalog/products/${id}`).then((r) => r.data);
