import { NavLink, Outlet, useMatches } from 'react-router-dom';
import { DoubleRule } from '@/components/brand/DoubleRule';
import { Logo } from '@/components/brand/Logo';
import { NotPermitted } from '@/components/feedback/NotPermitted';
import { consoleMenu, visibleItems } from '@/config/navigation';
import { useAuthStore } from '@/store/authStore';
import type { RouteHandle } from '@/app/router/helpers';

export function ConsoleLayout() {
  const { user, hasPermission, clear } = useAuthStore();
  const matches = useMatches();
  const required = matches
    .map((m) => (m.handle as RouteHandle | undefined)?.permission)
    .filter(Boolean) as string[];
  const allowed = required.every((p) => hasPermission(p));
  const menu = visibleItems(consoleMenu, hasPermission);
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
          aria-label="Console"
          className="w-56 shrink-0 border-r border-line bg-white p-3 text-sm print:hidden"
        >
          <ul className="space-y-1">
            {menu.map((m) => (
              <li key={m.to}>
                <NavLink
                  to={m.to}
                  end={m.to === '/console'}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${isActive ? 'bg-green-50 font-bold text-brand-green' : 'text-ink'}`
                  }
                >
                  {m.label}
                </NavLink>
                {m.children && (
                  <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-line pl-2">
                    {m.children.map((c) => (
                      <li key={c.to}>
                        <NavLink
                          to={c.to}
                          end
                          className={({ isActive }) =>
                            `block rounded px-2 py-1.5 ${isActive ? 'font-bold text-brand-green' : 'text-ink'}`
                          }
                        >
                          {c.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 p-4">{allowed ? <Outlet /> : <NotPermitted />}</main>
      </div>
    </div>
  );
}
