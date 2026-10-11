import { NavLink, Outlet } from 'react-router-dom';
import { DoubleRule } from '@/components/brand/DoubleRule';
import { Logo } from '@/components/brand/Logo';
import { portalMenu } from '@/config/navigation';
import { useAuthStore } from '@/store/authStore';

export function PortalLayout() {
  const { user, clear } = useAuthStore();
  return (
    <div className="flex min-h-screen flex-col bg-surface-alt">
      <header className="bg-white">
        <div className="flex items-center justify-between px-4 py-2">
          <Logo small />
          <span className="text-sm">
            {user?.full_name}{' '}
            <button className="ml-2 text-brand-green underline" onClick={clear}>
              Sign out
            </button>
          </span>
        </div>
        <DoubleRule />
      </header>
      <div className="flex flex-1">
        <nav
          aria-label="Portal"
          className="w-56 shrink-0 border-r border-line bg-white p-3 text-sm print:hidden"
        >
          <ul className="space-y-1">
            {portalMenu.map((m) => (
              <li key={m.to}>
                <NavLink
                  to={m.to}
                  end={m.to === '/portal'}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${isActive ? 'bg-green-50 font-bold text-brand-green' : 'text-ink'}`
                  }
                >
                  {m.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
