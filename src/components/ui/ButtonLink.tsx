import { Link, type LinkProps } from 'react-router-dom';
import clsx from 'clsx';

/** A link that looks like a button. */
export function ButtonLink({
  variant = 'primary',
  className,
  ...rest
}: LinkProps & { variant?: 'primary' | 'secondary' }) {
  return (
    <Link
      className={clsx(
        'inline-flex min-h-[44px] items-center justify-center rounded-md px-5 py-2 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-indigo',
        variant === 'primary'
          ? 'bg-brand-accent text-ink hover:brightness-95'
          : 'border border-brand-green bg-white text-brand-green hover:bg-green-50',
        className,
      )}
      {...rest}
    />
  );
}
