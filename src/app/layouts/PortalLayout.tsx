import { NavLink, Outlet, Link } from 'react-router-dom';
import { DoubleRule } from '@/components/brand/DoubleRule';
import { Logo } from '@/components/brand/Logo';
import { useAuthStore } from '@/store/authStore';

export const AVATARS: Record<string, string> = {
  'u-admin': '/profile/kayeera-nathan.png',
  'u-sarah': '/profile/kayeera-nathan.png',
};

const NAV_GROUPS = [
  {
    label: 'My Portal',
    items: [
      { label: 'Dashboard', to: '/portal', icon: '⊞', end: true },
      { label: 'Quotes', to: '/portal/quotes', icon: '📋' },
      { label: 'Projects', to: '/portal/projects', icon: '⚙' },
      { label: 'My Systems', to: '/portal/systems', icon: '⚡' },
      { label: 'Warranties', to: '/portal/warranties', icon: '🛡' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Billing', to: '/portal/billing', icon: '₤' },
      { label: 'Invoices', to: '/portal/invoices', icon: '🧾' },
      { label: 'Orders', to: '/portal/orders', icon: '📦' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Support', to: '/portal/support/new', icon: '✉' },
      { label: 'Account', to: '/portal/account', icon: '👤' },
      { label: 'Privacy', to: '/portal/privacy', icon: '🔒' },
    ],
  },
];

const linkBase =
  'flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-semibold transition-colors w-full';
const linkActive = 'bg-[#1D6434] text-white';
const linkIdle = 'text-[#3c4540] hover:bg-[#eef3ee] hover:text-[#1D6434]';

export function PortalLayout() {
  const { user, clear } = useAuthStore();

  const avatar = user ? (user.avatar ?? AVATARS[user.id] ?? null) : null;
  const initials =
    user?.full_name
      ?.split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('') ?? '?';

  return (
    <div className="flex min-h-screen flex-col bg-surface-alt">
      <header className="bg-white sticky top-0 z-30">
        <div className="grid grid-cols-3 items-center px-4 py-2">
          <Link to="/" className="flex items-center gap-3">
            <Logo small />
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-black tracking-tight text-[#14202E]">TCOIN Solar</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#1D6434]">
                Uganda
              </span>
            </div>
          </Link>
          <span className="text-center text-2xl font-black uppercase tracking-widest text-[#1D6434]">
            Customer Portal
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
            <Link
              to="/store"
              className="relative p-1.5 text-[#14202E] hover:text-[#1D6434]"
              aria-label="Cart"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </Link>
            <span className="text-[13px] font-bold text-[#14202E]">Welcome back, {user?.full_name}</span>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                background: avatar ? undefined : 'linear-gradient(135deg,#1D6434,#155228)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
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
            <button className="text-xs text-brand-green underline" onClick={clear}>
              Sign out
            </button>
          </div>
        </div>
        <DoubleRule />
      </header>

      <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
        <nav
          aria-label="Portal"
          className="w-52 shrink-0 border-r border-line bg-white print:hidden"
          style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}
        >
          {/* Profile photo */}
          <div
            style={{
              flexShrink: 0,
              borderBottom: '1px solid #e0e5e2',
              background: '#f1f4f1',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 0',
            }}
          >
            {avatar ? (
              <>
                <div
                  style={{
                    width: 160,
                    height: 160,
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '2px solid #e0e5e2',
                    borderRadius: 8,
                  }}
                >
                  <img
                    src={avatar}
                    alt={user?.full_name ?? ''}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#3c4540',
                    textAlign: 'center',
                    padding: '0 8px',
                  }}
                >
                  {user?.full_name}
                </span>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#1D6434,#155228)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {initials}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#3c4540' }}>{user?.full_name}</span>
              </>
            )}
          </div>

          {/* Grouped nav */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
            {NAV_GROUPS.map((group, gi) => (
              <div key={gi}>
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#9ba19d',
                    padding: '6px 8px 3px',
                  }}
                >
                  {group.label}
                </p>
                {group.items.map((m) => (
                  <NavLink
                    key={m.to}
                    to={m.to}
                    end={'end' in m ? (m as { end?: boolean }).end : false}
                    className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
                  >
                    <span style={{ fontSize: 13, width: 18, textAlign: 'center', flexShrink: 0 }}>
                      {m.icon}
                    </span>
                    {m.label}
                  </NavLink>
                ))}
                {gi < NAV_GROUPS.length - 1 && (
                  <div style={{ margin: '5px 4px', borderTop: '1px solid #e0e5e2' }} />
                )}
              </div>
            ))}
          </div>

          {/* Store CTA pinned at bottom */}
          <div style={{ borderTop: '1px solid #e0e5e2', padding: '8px 6px', flexShrink: 0 }}>
            <Link to="/store" className={`${linkBase} ${linkIdle}`}>
              <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>🛒</span>
              Visit Store
            </Link>
          </div>
        </nav>

        <main className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
