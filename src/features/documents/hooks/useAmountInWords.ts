import { useMemo } from 'react';
import { amountInWords } from '@/lib/amountInWords';
import type { CurrencyCode } from '@/types/domain';

export const useAmountInWords = (amount: number, currency: CurrencyCode = 'UGX') =>
  useMemo(() => amountInWords(amount, currency), [amount, currency]);
