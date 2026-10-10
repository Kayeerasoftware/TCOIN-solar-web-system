import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'danger';
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; busy?: boolean }

const styles: Record<Variant, string> = {
  primary: 'bg-brand-accent text-ink hover:brightness-95',
  secondary: 'border border-brand-green bg-white text-brand-green hover:bg-green-50',
  danger: 'bg-brand-red text-white hover:brightness-95',
};

export function Button({ variant = 'primary', busy, className, children, disabled, ...rest }: Props) {
  return (
    <button
      className={clsx('min-h-[44px] rounded-md px-5 py-2 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-indigo disabled:opacity-50', styles[variant], className)}
      disabled={disabled || busy}
      aria-busy={busy}
      {...rest}
    >
      {children}
    </button>
  );
}
