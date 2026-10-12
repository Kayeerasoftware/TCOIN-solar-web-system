import { z } from 'zod';
import { requiredText } from '@/lib/validators';

export const leadCaptureSchema = z
  .object({
    full_name: requiredText('Name'),
    phone: z.string().trim().optional(),
    email: z.string().trim().email('Enter a valid email address').or(z.literal('')).optional(),
    consent: z.boolean().optional(),
  })
  .refine((v) => !!v.phone || !!v.email, {
    path: ['phone'],
    message: 'Give a phone number or an email address',
  });
export type LeadCaptureForm = z.infer<typeof leadCaptureSchema>;
