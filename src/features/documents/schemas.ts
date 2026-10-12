import { z } from 'zod';
import { requiredText } from '@/lib/validators';

const num = z.preprocess(
  (v) => (v === '' || v === null || (typeof v === 'number' && Number.isNaN(v)) ? undefined : v),
  z.coerce.number().optional(),
);

export const receiptSchema = z
  .object({
    receipt_type: z.enum(['corporate', 'cash_sales']),
    received_from: requiredText('Received from'),
    received_from_address: z.string().optional(),
    method: z.enum(['cash', 'cheque', 'mtn_momo', 'airtel_money', 'bank_transfer', 'card']),
    cheque_no: z.string().optional(),
    payment_for: z.string().optional(),
    amount: num,
    lines: z
      .array(z.object({ particulars: z.string(), quantity: z.coerce.number(), rate: z.coerce.number() }))
      .optional(),
  })
  .superRefine((v, ctx) => {
    if (v.method === 'cheque' && !v.cheque_no?.trim())
      ctx.addIssue({ code: 'custom', path: ['cheque_no'], message: 'Enter the cheque number' });
    if (v.receipt_type === 'corporate' && !((v.amount ?? 0) > 0))
      ctx.addIssue({ code: 'custom', path: ['amount'], message: 'Enter an amount greater than zero' });
    if (
      v.receipt_type === 'cash_sales' &&
      !(v.lines ?? []).some((l) => l.particulars.trim() && l.quantity > 0)
    )
      ctx.addIssue({ code: 'custom', path: ['lines'], message: 'Add at least one item' });
  });
export type ReceiptFormValues = z.infer<typeof receiptSchema>;
