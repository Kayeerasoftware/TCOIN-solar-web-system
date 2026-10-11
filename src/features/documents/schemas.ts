import { z } from 'zod';
import { requiredText } from '@/lib/validators';

export const receiptSchema = z.object({
  received_from: requiredText('Received from'),
  amount: z.coerce.number().positive('Enter an amount'),
  method: z.enum(['cash', 'cheque', 'mtn_momo', 'airtel_money', 'bank_transfer']),
  cheque_no: z.string().optional(),
  payment_for: z.string().optional(),
});
export type ReceiptForm = z.infer<typeof receiptSchema>;
