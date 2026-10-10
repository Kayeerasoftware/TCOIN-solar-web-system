import { NavLink, Outlet } from 'react-router-dom';
import { DoubleRule } from '@/components/brand/DoubleRule';
import { Logo } from '@/components/brand/Logo';
import { portalMenu } from '@/config/navigation';
import { useAuthStore } from '@/store/authStore';

export function PortalLayout() {
  const { user, clear } = useAuthStore();
  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2">
          <Logo small />
          <nav aria-label="Portal" className="flex flex-wrap gap-4 text-sm">
            {portalMenu.map((m) => <NavLink key={m.to} to={m.to} end={m.to === '/portal'} className={({ isActive }) => (isActive ? 'font-bold text-brand-green' : 'text-ink')}>{m.label}</NavLink>)}
          </nav>
          <span className="text-sm">{user?.full_name} <button className="ml-2 text-brand-green underline" onClick={clear}>Sign out</button></span>
        </div>
        <DoubleRule />
      </header>
      <main className="mx-auto max-w-6xl p-4"><Outlet /></main>
    </div>
  );
}
