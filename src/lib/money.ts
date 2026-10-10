import type { CurrencyCode } from '@/types/domain';

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;
export const lineAmount = (quantity: number, rate: number): number => round2(quantity * rate);
export const sumAmounts = (values: number[]): number => round2(values.reduce((a, b) => a + b, 0));

export function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** UGX has no minor unit on forms; other currencies show two decimals. */
export function formatMoney(amount: number | string, currency: CurrencyCode = 'UGX'): string {
  const n = Number(amount);
  const d = currency === 'UGX' ? 0 : 2;
  return `${currency} ${formatNumber(n, d)}`;
}
