import { Link, Outlet } from 'react-router-dom';
import { DoubleRule } from '@/components/brand/DoubleRule';
import { Logo } from '@/components/brand/Logo';
import { RedirectIfAuthed } from '@/app/router/guards';

export function AuthLayout() {
  return (
    <RedirectIfAuthed>
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-alt p-4">
        <div className="w-full max-w-md overflow-hidden rounded-lg border border-line bg-white shadow">
          <div className="flex justify-center p-4">
            <Logo />
          </div>
          <DoubleRule />
          <div className="p-6">
            <Outlet />
          </div>
          <DoubleRule />
          <div className="flex justify-center p-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:underline"
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </RedirectIfAuthed>
  );
}
