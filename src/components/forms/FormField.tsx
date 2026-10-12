import type { ReactNode } from 'react';

interface Props {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Label, control, hint, and error message. The error is linked to the control for screen readers. */
export function FormField({ label, htmlFor, error, hint, children }: Props) {
  return (
    <div className="mb-3">
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1 text-sm text-brand-red">
          {error}
        </p>
      )}
    </div>
  );
}
