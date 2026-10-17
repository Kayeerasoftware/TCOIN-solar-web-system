import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { DoubleRule } from '@/components/brand/DoubleRule';
import { Logo } from '@/components/brand/Logo';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/app/router/guards';

const SERVICES = [
  {
    to: '/services/design',
    icon: '📐',
    label: 'System Design',
    desc: 'Site survey, sizing & single-line diagrams',
  },
  {
    to: '/services/installation',
    icon: '⚡',
    label: 'Installation',
    desc: 'Certified crews & commissioning records',
  },
  {
    to: '/services/maintenance',
    icon: '🔧',
    label: 'Maintenance',
    desc: 'Service plans & fast fault response',
  },
  {
    to: '/services/consultancy',
    icon: '💡',
    label: 'Consultancy',
    desc: 'Energy audits & feasibility studies',
  },
];

const NAV_LINKS = [
  { label: 'Calculator', to: 'CALC' },
  { label: 'Store/Shop', to: '/store' },
  { label: 'Projects', to: '/projects' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export function PublicHeader({ alwaysSolid = false }: { alwaysSolid?: boolean }) {
  const p = useCompanyProfile();
  const user = useAuthStore((s) => s.user);
  const calcTarget = user?.user_type === 'customer' ? '/portal/quotes' : '/calculator';
  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const { pathname } = useLocation();
  const dropRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openServices = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  }, []);
  const closeServices = useCallback(() => {
    closeTimer.current = setTimeout(() => setServicesOpen(false), 120);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setServicesOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  const solid = alwaysSolid || pathname !== '/' || scrolled;

  return (
    <>
      <style>{`
        .nav-link {
          position: relative;
          transition: color 0.18s ease, background 0.18s ease;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          left: 50%; bottom: 4px;
          width: 0; height: 2px;
          border-radius: 2px;
          background: #1D6434;
          transition: width 0.22s ease, left 0.22s ease;
        }
        .nav-link:hover::after,
        .nav-link[data-active='true']::after {
          width: calc(100% - 2rem);
          left: 1rem;
        }
        .nav-services {
          position: relative;
          transition: color 0.18s ease, background 0.18s ease;
        }
        .nav-services::after {
          content: '';
          position: absolute;
          left: 50%; bottom: 4px;
          width: 0; height: 2px;
          border-radius: 2px;
          background: #1D6434;
          transition: width 0.22s ease, left 0.22s ease;
        }
        .nav-services:hover::after,
        .nav-services[data-active='true']::after {
          width: calc(100% - 2rem);
          left: 1rem;
        }
        .nav-cta {
          transition: transform 0.18s ease, box-shadow 0.18s ease !important;
        }
        .nav-cta:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 28px rgba(29,100,52,0.38) !important;
        }
        .nav-outline {
          transition: transform 0.18s ease, border-color 0.18s ease, color 0.18s ease !important;
        }
        .nav-outline:hover {
          transform: translateY(-2px) !important;
          border-color: #1D6434 !important;
          color: #1D6434 !important;
        }
        .nav-icon {
          position: relative;
          transition: transform 0.18s ease !important;
        }
        .nav-icon::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 12px;
          background: transparent;
          transition: background 0.18s ease;
        }
        .nav-icon:hover {
          transform: scale(1.18) !important;
        }
        .nav-icon:hover::before {
          background: rgba(29,100,52,0.09);
        }
      `}</style>
      {/* ── STICKY HEADER BAR ── */}
      <header
        className="sticky top-0 z-40 transition-all duration-300 print:hidden"
        style={{
          background: solid ? 'rgba(255,255,255,0.97)' : 'rgba(0,0,0,0.18)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: solid ? '0 1px 0 rgba(0,0,0,0.06),0 8px 32px rgba(0,0,0,0.07)' : 'none',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <Logo small />
            <div className="hidden sm:flex flex-col leading-tight">
              <span
                className="text-[13px] font-black tracking-tight"
                style={{ color: solid ? '#14202E' : '#fff' }}
              >
                TCOIN Solar
              </span>
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: solid ? '#1D6434' : 'rgba(255,255,255,0.55)' }}
              >
                Uganda
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden lg:flex items-center gap-0.5">
            {/* Services dropdown */}
            <div ref={dropRef} className="relative" onMouseEnter={openServices} onMouseLeave={closeServices}>
              <button
                onClick={() => setServicesOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={servicesOpen}
                className="nav-services flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{
                  color: pathname.startsWith('/services')
                    ? '#1D6434'
                    : solid
                      ? '#14202E'
                      : 'rgba(255,255,255,0.85)',
                  background: servicesOpen
                    ? solid
                      ? 'rgba(29,100,52,0.08)'
                      : 'rgba(255,255,255,0.12)'
                    : 'transparent',
                }}
              >
                Services
                <svg
                  style={{
                    transition: 'transform 0.22s ease',
                    transform: servicesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Mega-menu — always in DOM, animated via opacity+transform */}
              <div
                role="menu"
                aria-label="Services"
                onMouseEnter={openServices}
                onMouseLeave={closeServices}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  left: '50%',
                  transform: servicesOpen
                    ? 'translateX(-50%) translateY(0)'
                    : 'translateX(-50%) translateY(-8px)',
                  opacity: servicesOpen ? 1 : 0,
                  pointerEvents: servicesOpen ? 'auto' : 'none',
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                  width: '580px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.15),0 0 0 1px rgba(0,0,0,0.07)',
                  display: 'flex',
                  zIndex: 50,
                }}
              >
                {/* left green panel */}
                <div
                  style={{
                    width: '180px',
                    flexShrink: 0,
                    background: 'linear-gradient(160deg,#1D6434 0%,#0f3d1e 100%)',
                    padding: '1.75rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>☀️</div>
                    <p
                      style={{
                        margin: '0 0 6px',
                        fontSize: '0.78rem',
                        fontWeight: 900,
                        color: '#fff',
                        lineHeight: 1.3,
                      }}
                    >
                      Everything solar, under one roof.
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.7rem',
                        color: 'rgba(255,255,255,0.55)',
                        lineHeight: 1.5,
                      }}
                    >
                      Design · Install · Maintain · Advise
                    </p>
                  </div>
                  <Link
                    to="/get-quote"
                    onClick={() => setServicesOpen(false)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '1.5rem',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '8px 12px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#fff',
                      textDecoration: 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                  >
                    Free Quote →
                  </Link>
                </div>

                {/* right cards */}
                <div style={{ flex: 1, background: '#fff', padding: '0.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    {SERVICES.map((s) => (
                      <Link
                        key={s.to}
                        to={s.to}
                        role="menuitem"
                        onClick={() => setServicesOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          borderRadius: '12px',
                          padding: '12px',
                          textDecoration: 'none',
                          transition: 'background 0.15s',
                          background: pathname === s.to ? 'rgba(29,100,52,0.07)' : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (pathname !== s.to) e.currentTarget.style.background = '#F4F6F9';
                        }}
                        onMouseLeave={(e) => {
                          if (pathname !== s.to) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'rgba(29,100,52,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem',
                            flexShrink: 0,
                          }}
                        >
                          {s.icon}
                        </div>
                        <div>
                          <p
                            style={{
                              margin: '0 0 2px',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              color: pathname === s.to ? '#1D6434' : '#14202E',
                            }}
                          >
                            {s.label}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: '#5A6878', lineHeight: 1.45 }}>
                            {s.desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div
                    style={{
                      borderTop: '1px solid #EAECF0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 8px 4px',
                      marginTop: '6px',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: '#9AA3AE' }}>Not sure what you need?</span>
                    <Link
                      to={calcTarget}
                      onClick={() => setServicesOpen(false)}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#1D6434',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      Try the calculator →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {NAV_LINKS.map((m) => (
              <NavLink
                key={m.to}
                to={m.to === 'CALC' ? calcTarget : m.to}
                className={({ isActive }) =>
                  `nav-link px-4 py-2 rounded-xl text-sm font-semibold ${
                    isActive
                      ? 'text-[#1D6434] bg-[rgba(29,100,52,0.08)]'
                      : solid
                        ? 'text-[#14202E]'
                        : 'text-white/85'
                  }`
                }
                data-active={undefined}
              >
                {m.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <a
              href={`tel:${p.mobile}`}
              className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
              style={{ color: solid ? '#5A6878' : 'rgba(255,255,255,0.65)' }}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z"
                />
              </svg>
              <span className="hidden 2xl:inline">{p.mobile}</span>
            </a>

            <Link
              to="/cart"
              className="nav-icon relative p-2.5 rounded-xl"
              style={{ color: solid ? '#14202E' : 'rgba(255,255,255,0.8)' }}
              aria-label="Cart"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {user && cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1D6434] text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <div
              className="hidden sm:block w-px h-6 mx-1"
              style={{ background: solid ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)' }}
            />

            {user ? (
              <>
                <Link
                  to={user.user_type === 'customer' ? '/portal' : '/console'}
                  className="nav-outline hidden sm:inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold"
                  style={
                    solid
                      ? { border: '1.5px solid #D9DEE5', color: '#14202E' }
                      : {
                          border: '1.5px solid rgba(255,255,255,0.3)',
                          color: '#fff',
                          background: 'rgba(255,255,255,0.1)',
                        }
                  }
                >
                  {user.user_type === 'customer' ? 'My Portal' : 'Console'}
                </Link>
                <button
                  onClick={signOut}
                  className="nav-cta hidden md:inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white"
                  style={{ background: '#e53935', boxShadow: '0 2px 8px rgba(229,57,53,0.3)' }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-outline hidden sm:inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold"
                  style={
                    solid
                      ? { border: '1.5px solid #D9DEE5', color: '#14202E' }
                      : {
                          border: '1.5px solid rgba(255,255,255,0.3)',
                          color: '#fff',
                          background: 'rgba(255,255,255,0.1)',
                        }
                  }
                >
                  Sign in
                </Link>
                <Link
                  to="/get-quote"
                  className="nav-cta hidden md:inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg,#1D6434 0%,#155228 100%)',
                    boxShadow: '0 2px 8px rgba(29,100,52,0.3)',
                  }}
                >
                  Free Quote
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </>
            )}

            {/* Hamburger — animates to X */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden relative w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-xl transition-colors"
              style={{ background: mobileOpen ? 'rgba(29,100,52,0.1)' : 'transparent' }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span
                style={{
                  display: 'block',
                  width: '18px',
                  height: '2px',
                  borderRadius: '2px',
                  background: solid ? '#14202E' : '#fff',
                  transition: 'transform 0.25s ease, opacity 0.25s ease',
                  transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none',
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: '18px',
                  height: '2px',
                  borderRadius: '2px',
                  background: solid ? '#14202E' : '#fff',
                  transition: 'opacity 0.25s ease',
                  opacity: mobileOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: '18px',
                  height: '2px',
                  borderRadius: '2px',
                  background: solid ? '#14202E' : '#fff',
                  transition: 'transform 0.25s ease, opacity 0.25s ease',
                  transform: mobileOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
                }}
              />
            </button>
          </div>
        </div>

        <DoubleRule />
      </header>

      {/* ── MOBILE DRAWER — rendered as sibling so it escapes the sticky stacking context ── */}
      <div
        className="lg:hidden"
        style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: mobileOpen ? 'auto' : 'none' }}
        aria-hidden={!mobileOpen}
      >
        {/* backdrop */}
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            opacity: mobileOpen ? 1 : 0,
            transition: 'opacity 0.28s ease',
          }}
        />

        {/* drawer panel */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 'min(320px, 88vw)',
            background: '#fff',
            boxShadow: '-12px 0 48px rgba(0,0,0,0.2)',
            transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {/* drawer top bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 1rem',
              height: '64px',
              borderBottom: '1px solid #EAECF0',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg,#1D6434,#155228)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                }}
              >
                ☀️
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#14202E' }}>TCOIN Solar</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #E5E9EF',
                background: '#F4F6F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#14202E" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* nav items */}
          <div style={{ flex: 1, padding: '0.5rem 0.75rem', overflowY: 'auto' }}>
            {/* Services accordion */}
            <button
              onClick={() => setMobileServices((v) => !v)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 10px',
                borderRadius: '10px',
                border: 'none',
                background:
                  mobileServices || pathname.startsWith('/services') ? 'rgba(29,100,52,0.07)' : 'transparent',
                cursor: 'pointer',
                marginBottom: '2px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: pathname.startsWith('/services') ? '#1D6434' : '#D9DEE5',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: pathname.startsWith('/services') ? '#1D6434' : '#14202E',
                  }}
                >
                  Services
                </span>
              </span>
              <svg
                style={{
                  transition: 'transform 0.22s ease',
                  transform: mobileServices ? 'rotate(180deg)' : 'rotate(0deg)',
                  flexShrink: 0,
                }}
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#5A6878"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* service sub-items — max-height accordion */}
            <div
              style={{
                overflow: 'hidden',
                maxHeight: mobileServices ? '360px' : '0',
                transition: 'max-height 0.3s ease',
              }}
            >
              <div
                style={{
                  paddingLeft: '0.5rem',
                  paddingBottom: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {SERVICES.map((s) => (
                  <Link
                    key={s.to}
                    to={s.to}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '9px 10px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      background: pathname === s.to ? 'rgba(29,100,52,0.08)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onTouchStart={(e) => {
                      if (pathname !== s.to) (e.currentTarget as HTMLElement).style.background = '#F4F6F9';
                    }}
                    onTouchEnd={(e) => {
                      if (pathname !== s.to)
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '9px',
                        background: 'rgba(29,100,52,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        flexShrink: 0,
                      }}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <p
                        style={{
                          margin: '0 0 1px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: pathname === s.to ? '#1D6434' : '#14202E',
                        }}
                      >
                        {s.label}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#5A6878', lineHeight: 1.4 }}>
                        {s.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* other nav links */}
            {NAV_LINKS.map((m) => (
              <NavLink
                key={m.to}
                to={m.to === 'CALC' ? calcTarget : m.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 10px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  marginBottom: '2px',
                  color: isActive ? '#1D6434' : '#14202E',
                  background: isActive ? 'rgba(29,100,52,0.07)' : 'transparent',
                })}
              >
                {({ isActive }) => (
                  <>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: isActive ? '#1D6434' : '#D9DEE5',
                      }}
                    />
                    {m.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* bottom CTA strip */}
          <div
            style={{
              padding: '0.75rem',
              borderTop: '1px solid #EAECF0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            {user ? (
              <>
                <Link
                  to={user.user_type === 'customer' ? '/portal' : '/console'}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: '#fff',
                    textDecoration: 'none',
                    background: 'linear-gradient(135deg,#1D6434 0%,#155228 100%)',
                    boxShadow: '0 4px 14px rgba(29,100,52,0.28)',
                  }}
                >
                  {user.user_type === 'customer' ? 'My Portal →' : 'Console →'}
                </Link>
                <button
                  onClick={signOut}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    borderRadius: '10px',
                    padding: '11px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#fff',
                    background: '#e53935',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/get-quote"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: '#fff',
                    textDecoration: 'none',
                    background: 'linear-gradient(135deg,#1D6434 0%,#155228 100%)',
                    boxShadow: '0 4px 14px rgba(29,100,52,0.28)',
                  }}
                >
                  Get a Free Quote →
                </Link>
                <Link
                  to="/login"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    borderRadius: '10px',
                    padding: '11px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#14202E',
                    textDecoration: 'none',
                    border: '1.5px solid #D9DEE5',
                  }}
                >
                  Sign in
                </Link>
              </>
            )}
            <a
              href={`tel:${p.mobile}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                padding: '6px',
                fontSize: '0.8rem',
                color: '#5A6878',
                textDecoration: 'none',
              }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z"
                />
              </svg>
              {p.mobile}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
