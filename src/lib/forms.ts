import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from '@/api/errors';

/** Puts server validation messages next to their fields; anything else becomes a form-level message. */
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): void {
  if (error instanceof ApiError && Object.keys(error.fieldErrors).length) {
    for (const [field, message] of Object.entries(error.fieldErrors)) setError(field as Path<T>, { message });
    return;
  }
  setError('root', { message: error instanceof Error ? error.message : 'Something went wrong' });
}
