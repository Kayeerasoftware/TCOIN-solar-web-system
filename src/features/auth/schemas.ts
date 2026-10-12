import { z } from 'zod';
import { requiredText } from '@/lib/validators';

export const loginSchema = z.object({
  identifier: requiredText('Email or phone'),
  password: requiredText('Password'),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const phoneSchema = z.object({ phone: requiredText('Phone number') });
export const codeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, 'Enter the code you received'),
});
