import { Outlet, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { PublicHeader } from './PublicHeader';

export function PublicLayout() {
  const p = useCompanyProfile();
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      {/* ── MAIN ── */}
      <main className="flex-1" style={{ marginTop: isHome ? '-72px' : 0 }}>
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0d1a10] text-white print:hidden">
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
