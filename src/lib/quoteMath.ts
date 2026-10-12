import { amountInWords } from './amountInWords';
import { lineAmount, round2, sumAmounts } from './money';
import type { CurrencyCode } from '@/types/domain';

export interface RawLine {
  particulars: string;
  specification?: string;
  unit: string;
  quantity: number;
  rate: number;
}

export function withAmounts<T extends RawLine>(lines: T[]): (T & { line_no: number; amount: number })[] {
  return lines.map((l, i) => ({ ...l, line_no: i + 1, amount: lineAmount(l.quantity, l.rate) }));
}

export function computeTotals(lines: RawLine[], discountPct: number, currency: CurrencyCode = 'UGX') {
  const subtotal = sumAmounts(lines.map((l) => lineAmount(l.quantity, l.rate)));
  const discount_amount = round2((subtotal * discountPct) / 100);
  const total = round2(subtotal - discount_amount);
  return {
    subtotal,
    discount_amount,
    total,
    amount_in_words: total > 0 ? amountInWords(total, currency) : '',
  };
}
