import { NavLink, Outlet, Link } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';

const CATEGORIES = [
  { value: 'panels', label: '☀️ Solar Panels' },
  { value: 'inverters', label: '⚡ Inverters' },
  { value: 'batteries', label: '🔋 Batteries' },
  { value: 'controllers', label: '🎛️ Controllers' },
  { value: 'mounting', label: '🔩 Mounting' },
  { value: 'pumps', label: '💧 Pumps' },
  { value: 'accessories', label: '🔌 Accessories' },
];

export function StoreLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f5f5f5',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Main site header ── */}
      <PublicHeader alwaysSolid />

      {/* ── Store category bar ── */}
      <div
        style={{
          background: '#155228',
          position: 'sticky',
          top: 72,
          zIndex: 39,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div
          style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', overflowX: 'auto' }}
        >
          <NavLink
            to="/store"
            end
            style={({ isActive }) => ({
              padding: '7px 14px',
              color: isActive ? '#f5a623' : 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              borderBottom: isActive ? '2px solid #f5a623' : '2px solid transparent',
            })}
          >
            All Products
          </NavLink>
          {CATEGORIES.map((c) => (
            <NavLink
              key={c.value}
              to={`/store?category=${c.value}`}
              style={({ isActive }) => ({
                padding: '7px 14px',
                color: isActive ? '#f5a623' : 'rgba(255,255,255,0.8)',
                textDecoration: 'none',
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                borderBottom: isActive ? '2px solid #f5a623' : '2px solid transparent',
              })}
            >
              {c.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* ── Page content ── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: '#1d2f25', color: 'rgba(255,255,255,0.6)', marginTop: 40 }}>
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '40px 20px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 32,
          }}
        >
          <div>
            <img
              src="/brand/TCOIN LOGO OFFICIAL.svg"
              alt="TCOIN"
              style={{ height: 40, filter: 'brightness(0) invert(1)', opacity: 0.8, marginBottom: 10 }}
            />
            <p style={{ fontSize: 11, lineHeight: 1.6, margin: 0 }}>
              Nabulagala, near Kasubi Royal Tombs
              <br />
              P.O. Box 500273, Kampala, Uganda
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
                marginBottom: 10,
              }}
            >
              Shop
            </p>
            {CATEGORIES.map((c) => (
              <div key={c.value} style={{ marginBottom: 6 }}>
                <Link
                  to={`/store?category=${c.value}`}
                  style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 12 }}
                >
                  {c.label}
                </Link>
              </div>
            ))}
          </div>
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
                marginBottom: 10,
              }}
            >
              Help
            </p>
            {[
              { to: '/cart', label: 'My Cart' },
              { to: '/portal/orders', label: 'My Orders' },
              { to: '/contact', label: 'Contact Us' },
              { to: '/faq', label: 'FAQ' },
            ].map((l) => (
              <div key={l.to} style={{ marginBottom: 6 }}>
                <Link
                  to={l.to}
                  style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 12 }}
                >
                  {l.label}
                </Link>
              </div>
            ))}
          </div>
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
                marginBottom: 10,
              }}
            >
              Contact
            </p>
            <p style={{ fontSize: 12, margin: '0 0 6px' }}>📞 0779 116 709</p>
            <p style={{ fontSize: 12, margin: '0 0 6px' }}>📞 0705 998 786</p>
            <p style={{ fontSize: 12, margin: '0 0 6px' }}>✉️ info.tcoinug@gmail.com</p>
            <Link
              to="/calculator"
              style={{
                display: 'inline-block',
                marginTop: 12,
                padding: '8px 16px',
                background: '#f5a623',
                color: '#fff',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Free Solar Calculator →
            </Link>
          </div>
        </div>
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '14px 20px',
            textAlign: 'center',
            fontSize: 10,
            color: 'rgba(255,255,255,0.25)',
          }}
        >
          © {new Date().getFullYear()} TCOIN Solar UG. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
