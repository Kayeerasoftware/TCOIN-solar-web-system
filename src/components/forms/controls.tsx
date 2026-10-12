import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import clsx from 'clsx';

const base =
  'min-h-[44px] w-full rounded-md border bg-white px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-indigo';
const tone = (invalid?: boolean) => (invalid ? 'border-brand-red' : 'border-line');

interface Invalid {
  invalid?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & Invalid>(
  function TextInput({ invalid, className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && rest.id ? `${rest.id}-error` : undefined}
        className={clsx(base, tone(invalid), className)}
        {...rest}
      />
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & Invalid>(
  function Select({ invalid, className, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={clsx(base, tone(invalid), className)}
        {...rest}
      >
        {children}
      </select>
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & Invalid
>(function Textarea({ invalid, className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={clsx(base, 'min-h-[88px]', tone(invalid), className)}
      {...rest}
    />
  );
});
