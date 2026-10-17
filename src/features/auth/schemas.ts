import { z } from 'zod';
import { requiredText } from '@/lib/validators';

export const loginSchema = z.object({
  identifier: requiredText('Email or phone'),
  password: requiredText('Password'),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  full_name: requiredText('Full name'),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type RegisterForm = z.infer<typeof registerSchema>;

export const phoneSchema = z.object({ phone: requiredText('Phone number') });
export const codeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, 'Enter the code you received'),
});
