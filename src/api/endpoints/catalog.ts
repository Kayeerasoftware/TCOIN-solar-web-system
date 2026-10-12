import { api } from '@/api/client';
import type { CatalogItem, Page, Product } from '@/types/api';

export const listProducts = (params?: Record<string, unknown>) =>
  api.get<Page<Product>>('/catalog/products', { params }).then((r) => r.data);

export const getProduct = (slug: string) => api.get<Product>(`/catalog/products/${slug}`).then((r) => r.data);

/** Flattens products into sellable variants for pickers. */
export const toCatalogItems = (products: Product[]): CatalogItem[] =>
  products.flatMap((p) =>
    p.variants.map((v) => ({
      variant_id: v.id,
      sku: v.sku,
      name: v.name,
      specification: p.spec_text ?? '',
      unit: v.unit,
      rate: Number(v.price.amount),
      available_qty: v.available_qty,
      image_url: v.image_url ?? null,
    })),
  );

export const listCatalogItems = () => listProducts().then((page) => toCatalogItems(page.data));
