import { Link, NavLink, Outlet } from 'react-router-dom';
import { DoubleRule } from '@/components/brand/DoubleRule';
import { Logo } from '@/components/brand/Logo';
import { publicMenu } from '@/config/navigation';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

export function PublicLayout() {
  const p = useCompanyProfile();
  return (
    <div className="flex min-h-screen flex-col bg-surface-alt">
      <header className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2">
          <Link to="/"><Logo small /></Link>
          <nav aria-label="Main" className="flex flex-wrap gap-4 text-sm">
            {publicMenu.map((m) => <NavLink key={m.to} to={m.to} className={({ isActive }) => (isActive ? 'font-bold text-brand-green' : 'text-ink')}>{m.label}</NavLink>)}
            <Link to="/login" className="font-bold text-brand-green">Sign in</Link>
          </nav>
        </div>
        <DoubleRule />
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-line bg-white px-4 py-6 text-sm text-ink-muted">
        <div className="mx-auto max-w-6xl">
          <b className="text-brand-green">{p.division_short}</b> | {p.address}, {p.po_box} | {p.mobile} | {p.email} | {p.web} | <i>{p.tagline}</i>
        </div>
      </footer>
    </div>
  );
}
