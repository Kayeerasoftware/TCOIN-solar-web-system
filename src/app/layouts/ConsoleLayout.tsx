import { NavLink, Outlet, useMatches } from 'react-router-dom';
import { DoubleRule } from '@/components/brand/DoubleRule';
import { Logo } from '@/components/brand/Logo';
import { NotPermitted } from '@/components/feedback/NotPermitted';
import { consoleMenu, visibleItems } from '@/config/navigation';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/app/router/guards';
import type { RouteHandle } from '@/app/router/helpers';

const AVATARS: Record<string, string> = {
  'u-admin': '/profile/kayeera-nathan.png',
};

export function ConsoleLayout() {
  const { user, hasPermission } = useAuthStore();
  const matches = useMatches();
  const required = matches
    .map((m) => (m.handle as RouteHandle | undefined)?.permission)
    .filter(Boolean) as string[];
  const allowed = required.every((p) => hasPermission(p));
  const menu = visibleItems(consoleMenu, hasPermission);

  const avatar = user ? (user.avatar ?? AVATARS[user.id] ?? null) : null;
  const initials =
    user?.full_name
      ?.split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('') ?? '?';

  return (
    <div className="flex min-h-screen flex-col bg-surface-alt">
      <header className="bg-white">
        <div className="flex items-center justify-between px-4 py-2">
          <Logo small />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                background: avatar ? undefined : 'linear-gradient(135deg,#1D6434,#155228)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 800,
                color: '#fff',
              }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={user?.full_name ?? ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                />
              ) : (
                initials
              )}
            </div>
            <span className="text-sm">
              {user?.full_name}{' '}
              <button onClick={signOut} className="ml-2 text-brand-green underline text-sm">
                Sign out
              </button>
            </span>
          </div>
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
