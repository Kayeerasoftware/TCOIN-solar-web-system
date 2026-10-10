import { Outlet } from 'react-router-dom';
import { DoubleRule } from '@/components/brand/DoubleRule';
import { Logo } from '@/components/brand/Logo';
import { RedirectIfAuthed } from '@/app/router/guards';

export function AuthLayout() {
  return (
    <RedirectIfAuthed>
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-alt p-4">
        <div className="w-full max-w-md overflow-hidden rounded-lg border border-line bg-white shadow">
          <div className="flex justify-center p-4"><Logo /></div>
          <DoubleRule />
          <div className="p-6"><Outlet /></div>
        </div>
      </div>
    </RedirectIfAuthed>
  );
}
