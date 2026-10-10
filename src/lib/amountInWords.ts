import type { CurrencyCode } from '@/types/domain';

const ONES = ['one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS = ['twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];

/** English words for a whole number. Mirrors platform.number_to_words in schema.sql. */
export function numberToWords(n: number): string {
  if (!Number.isInteger(n)) throw new Error('numberToWords expects an integer');
  if (n === 0) return 'zero';
  if (n < 0) return 'minus ' + numberToWords(-n);
  if (n < 20) return ONES[n - 1];
  if (n < 100) return TENS[Math.floor(n / 10) - 2] + (n % 10 ? '-' + ONES[(n % 10) - 1] : '');
  if (n < 1000) return ONES[Math.floor(n / 100) - 1] + ' hundred' + (n % 100 ? ' ' + numberToWords(n % 100) : '');
  const scales: [number, string][] = [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']];
  for (const [size, name] of scales) {
    if (n >= size) return numberToWords(Math.floor(n / size)) + ' ' + name + (n % size ? ' ' + numberToWords(n % size) : '');
  }
  return '';
}

const UNIT: Record<CurrencyCode, string> = { UGX: 'shillings', USD: 'US dollars', KES: 'Kenya shillings', EUR: 'euros' };

/** e.g. 2900000 -> "Two million nine hundred thousand shillings only". Mirrors platform.amount_in_words. */
export function amountInWords(amount: number, currency: CurrencyCode = 'UGX'): string {
  const abs = Math.abs(amount);
  const whole = Math.floor(abs);
  const cents = Math.round((abs - whole) * 100);
  const words = numberToWords(whole);
  let out = words.charAt(0).toUpperCase() + words.slice(1) + ' ' + UNIT[currency];
  if (cents > 0 && currency !== 'UGX') out += ' and ' + numberToWords(cents) + ' cents';
  return out + ' only';
}
