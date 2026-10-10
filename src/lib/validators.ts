import { z } from 'zod';

/** Uganda phone numbers: +256 followed by 9 digits, or a local number starting with 0. */
export const ugandaPhone = z
  .string()
  .trim()
  .regex(/^(\+256|0)\s?\d{3}\s?\d{3}\s?\d{3}$/, 'Enter a valid phone number, for example +256 779 116 709');

export const email = z.string().trim().email('Enter a valid email address');
export const money = z.coerce.number().min(0, 'Amount cannot be negative');
export const requiredText = (label: string) => z.string().trim().min(1, `${label} is required`);
