import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { DoubleRule } from '@/components/brand/DoubleRule';
import { Logo } from '@/components/brand/Logo';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useCartStore } from '@/store/cartStore';

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
  { label: 'Calculator', to: '/calculator' },
  { label: 'Store', to: '/store' },
  { label: 'Projects', to: '/projects' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export function PublicLayout() {
  const p = useCompanyProfile();
  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setServicesOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  const solid = !isHome || scrolled;

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="bg-[#1D6434] text-white text-center text-xs font-semibold py-2 px-4 tracking-wide z-50 relative">
        ☀️ Free site survey for all new installations in Kampala &amp; Wakiso —&nbsp;
        <Link to="/contact" className="underline underline-offset-2 hover:text-[#F5A623] transition-colors">
          Book now →
        </Link>
      </div>

      {/* ── NAV ── */}
      <header
        className="sticky top-0 z-40 transition-all duration-300"
        style={{
          background: solid ? 'rgba(255,255,255,0.97)' : 'rgba(0,0,0,0.18)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: solid ? '0 1px 0 rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.07)' : 'none',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 h-[72px]">
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <Logo small />
            <div className="hidden sm:flex flex-col leading-tight">
              <span
                className="text-[13px] font-black tracking-tight transition-colors"
                style={{ color: solid ? '#14202E' : '#fff' }}
              >
                TCOIN Solar
              </span>
              <span
                className="text-[10px] font-semibold uppercase tracking-widest transition-colors"
                style={{ color: solid ? '#1D6434' : 'rgba(255,255,255,0.55)' }}
              >
                Uganda
              </span>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <nav aria-label="Main" className="hidden lg:flex items-center gap-0.5">
            {/* Services mega-dropdown */}
            <div ref={dropRef} className="relative">
              <button
                onClick={() => setServicesOpen((v) => !v)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
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
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {servicesOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[500px] rounded-2xl bg-white p-3 grid grid-cols-2 gap-1.5"
                  style={{
                    boxShadow: '0 24px 64px rgba(0,0,0,0.13), 0 0 0 1px rgba(0,0,0,0.06)',
                  }}
                >
                  {SERVICES.map((s) => (
                    <Link
                      key={s.to}
                      to={s.to}
                      className="flex items-start gap-3 rounded-xl p-3.5 hover:bg-[#F4F6F9] transition-colors group"
                      onClick={() => setServicesOpen(false)}
                    >
                      <span className="text-2xl mt-0.5 shrink-0">{s.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-[#14202E] group-hover:text-[#1D6434] transition-colors">
                          {s.label}
                        </p>
                        <p className="text-xs text-[#5A6878] mt-0.5 leading-snug">{s.desc}</p>
                      </div>
                    </Link>
                  ))}
                  <div className="col-span-2 mt-1 pt-3 border-t border-[#EAECF0] flex items-center justify-between px-2">
                    <span className="text-xs text-[#5A6878]">Not sure what you need?</span>
                    <Link
                      to="/calculator"
                      onClick={() => setServicesOpen(false)}
                      className="text-xs font-bold text-[#1D6434] hover:underline"
                    >
                      Try the calculator →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {NAV_LINKS.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'text-[#1D6434] bg-[rgba(29,100,52,0.08)]'
                      : solid
                        ? 'text-[#14202E] hover:text-[#1D6434] hover:bg-[rgba(29,100,52,0.06)]'
                        : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {m.label}
              </NavLink>
            ))}
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-1.5">
            {/* Phone */}
            <a
              href={`tel:${p.mobile}`}
              className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
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

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl transition-all duration-150"
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
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1D6434] text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Divider */}
            <div
              className="hidden sm:block w-px h-6 mx-1"
              style={{ background: solid ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)' }}
            />

            {/* Sign in */}
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-150 hover:-translate-y-px"
              style={
                solid
                  ? { border: '1.5px solid #D9DEE5', color: '#14202E', background: 'transparent' }
                  : {
                      border: '1.5px solid rgba(255,255,255,0.3)',
                      color: '#fff',
                      background: 'rgba(255,255,255,0.1)',
                    }
              }
            >
              Sign in
            </Link>

            {/* Get Quote CTA */}
            <Link
              to="/contact"
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-px hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #1D6434 0%, #155228 100%)',
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

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2.5 rounded-xl transition-all duration-150"
              style={{ color: solid ? '#14202E' : '#fff' }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── DOUBLE RULE ── */}
        {solid && <DoubleRule />}

        {/* ── MOBILE DRAWER ── */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#EAECF0] bg-white/98 backdrop-blur-xl px-4 py-3 flex flex-col gap-0.5">
            <button
              onClick={() => setMobileServices((v) => !v)}
              className="flex items-center justify-between w-full text-sm font-semibold text-[#14202E] py-3 px-3 rounded-xl hover:bg-[#F4F6F9] transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D6434]" />
                Services
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${mobileServices ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {mobileServices && (
              <div className="ml-4 flex flex-col gap-0.5 mb-1">
                {SERVICES.map((s) => (
                  <Link
                    key={s.to}
                    to={s.to}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm text-[#5A6878] hover:bg-[#F4F6F9] hover:text-[#1D6434] transition-colors"
                  >
                    <span className="text-base">{s.icon}</span>
                    <span className="font-semibold">{s.label}</span>
                  </Link>
                ))}
              </div>
            )}

            {NAV_LINKS.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm font-semibold py-3 px-3 rounded-xl transition-colors ${
                    isActive
                      ? 'text-[#1D6434] bg-[rgba(29,100,52,0.08)]'
                      : 'text-[#14202E] hover:bg-[#F4F6F9] hover:text-[#1D6434]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-[#1D6434]' : 'bg-transparent'}`}
                    />
                    {m.label}
                  </>
                )}
              </NavLink>
            ))}

            <div className="mt-2 pt-3 border-t border-[#EAECF0] flex flex-col gap-2">
              <Link
                to="/login"
                className="text-center rounded-xl border-[1.5px] border-[#D9DEE5] py-3 text-sm font-bold text-[#14202E] hover:border-[#1D6434] hover:text-[#1D6434] transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/contact"
                className="text-center rounded-xl py-3 text-sm font-bold text-white transition-all hover:-translate-y-px"
                style={{ background: 'linear-gradient(135deg, #1D6434 0%, #155228 100%)' }}
              >
                Get a Free Quote →
              </Link>
              <a
                href={`tel:${p.mobile}`}
                className="text-center text-sm text-[#5A6878] hover:text-[#1D6434] transition-colors py-1.5 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
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
        )}
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1" style={{ marginTop: isHome ? '-72px' : 0 }}>
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0d1a10] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo className="brightness-0 invert opacity-90" />
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              {p.address}
              <br />
              {p.po_box}
            </p>
            <div className="mt-4 flex gap-3">
              {['𝕏', 'in', 'f'].map((s) => (
                <span
                  key={s}
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs text-white/40 cursor-pointer hover:border-[#F5A623] hover:text-[#F5A623] transition-colors"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Services</p>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <Link to="/services/design" className="hover:text-[#F5A623] transition-colors">
                System Design
              </Link>
              <Link to="/services/installation" className="hover:text-[#F5A623] transition-colors">
                Installation
              </Link>
              <Link to="/services/maintenance" className="hover:text-[#F5A623] transition-colors">
                Maintenance
              </Link>
              <Link to="/services/consultancy" className="hover:text-[#F5A623] transition-colors">
                Consultancy
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Company</p>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <Link to="/about" className="hover:text-[#F5A623] transition-colors">
                About Us
              </Link>
              <Link to="/projects" className="hover:text-[#F5A623] transition-colors">
                Projects
              </Link>
              <Link to="/store" className="hover:text-[#F5A623] transition-colors">
                Shop Components
              </Link>
              <Link to="/calculator" className="hover:text-[#F5A623] transition-colors">
                Solar Calculator
              </Link>
              <Link to="/contact" className="hover:text-[#F5A623] transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Contact</p>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <a href={`tel:${p.mobile}`} className="hover:text-[#F5A623] transition-colors">
                📞 {p.mobile}
              </a>
              <a href={`tel:${p.tel}`} className="hover:text-[#F5A623] transition-colors">
                ☎️ {p.tel}
              </a>
              <a href={`mailto:${p.email}`} className="hover:text-[#F5A623] transition-colors">
                ✉️ {p.email}
              </a>
            </div>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#F5A623] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-amber-500 hover:-translate-y-0.5"
            >
              Get a Free Quote →
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <span>
            © {new Date().getFullYear()} {p.legal_name}. All rights reserved.
          </span>
          <div className="flex gap-4">
            <Link to="/legal/privacy" className="hover:text-white/60 transition-colors">
              Privacy
            </Link>
            <Link to="/legal/terms" className="hover:text-white/60 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
