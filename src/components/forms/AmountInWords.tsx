import { amountInWords } from '@/lib/amountInWords';
import type { CurrencyCode } from '@/types/domain';

/** Shows the amount in words under a money field, as printed on TCOIN receipts and invoices. */
export function AmountInWords({ amount, currency = 'UGX' }: { amount: number; currency?: CurrencyCode }) {
  if (!amount) return null;
  return <p className="mt-1 text-sm italic text-ink-muted">{amountInWords(amount, currency)}</p>;
}
