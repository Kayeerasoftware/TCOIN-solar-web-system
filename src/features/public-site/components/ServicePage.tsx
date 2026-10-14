import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export interface ServicePageProps {
  title: string;
  subtitle: string;
  intro: string;
  photo: string;
  icon: string;
  accent: string;
  steps: { title: string; text: string }[];
  gets: { icon: string; title: string; text: string }[];
  extra?: ReactNode;
}

const OTHER_SERVICES = [
  {
    to: '/services/design',
    icon: '📐',
    title: 'System Design',
    text: 'Right-sized systems with a priced bill of materials.',
  },
  {
    to: '/services/installation',
    icon: '⚡',
    title: 'Installation',
    text: 'Certified crews, safety checklists and commissioning.',
  },
  {
    to: '/services/maintenance',
    icon: '🔧',
    title: 'Maintenance',
    text: 'Service plans, warranty tracking and fast fault response.',
  },
  {
    to: '/services/consultancy',
    icon: '💡',
    title: 'Consultancy',
    text: 'Energy audits, feasibility studies and design reviews.',
  },
];

const CSS = `
  .sp-steps  { display:grid; grid-template-columns:1fr; gap:0; }
  .sp-gets   { display:grid; grid-template-columns:1fr; gap:1.25rem; }
  .sp-others { display:grid; grid-template-columns:1fr; gap:1rem; }
  @media(min-width:640px){
    .sp-gets   { grid-template-columns:repeat(2,1fr); }
    .sp-others { grid-template-columns:repeat(2,1fr); }
  }
  @media(min-width:1024px){
    .sp-gets   { grid-template-columns:repeat(4,1fr); }
    .sp-others { grid-template-columns:repeat(3,1fr); }
  }
`;

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVis(true);
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

function Reveal({
  children,
  delay = 0,
  style,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const { ref, vis } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : 'translateY(24px)',
        transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function ServicePage({
  title,
  subtitle,
  intro,
  photo,
  icon,
  accent,
  steps,
  gets,
  extra,
}: ServicePageProps) {
  useDocumentTitle(title);
  const others = OTHER_SERVICES.filter((s) => s.title !== title && s.title !== subtitle);

  return (
    <div style={{ overflowX: 'hidden', background: '#fff' }}>
      <style>{CSS}</style>

      {/* ══ HERO ══ */}
      <section
        style={{
          position: 'relative',
          minHeight: '72vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src={photo}
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(105deg, rgba(0,0,0,.9) 0%, rgba(0,0,0,.65) 55%, rgba(0,0,0,.25) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 55%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            maxWidth: '1152px',
            margin: '0 auto',
            padding: '8rem 2rem 5rem',
            width: '100%',
          }}
        >
          {/* breadcrumb */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '2rem',
              fontSize: '0.78rem',
              color: 'rgba(255,255,255,.5)',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>
              Home
            </Link>
            <span>/</span>
            <span style={{ color: 'rgba(255,255,255,.5)' }}>Services</span>
            <span>/</span>
            <span style={{ color: '#F5A623', fontWeight: 600 }}>{subtitle}</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              borderRadius: '999px',
              border: `1px solid ${accent}55`,
              background: 'rgba(0,0,0,.3)',
              padding: '8px 20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: accent,
              backdropFilter: 'blur(8px)',
              marginBottom: '1.5rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{icon}</span>
            {subtitle}
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem,6vw,4.5rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              color: '#fff',
              margin: '0 0 1.25rem',
              letterSpacing: '-0.02em',
              maxWidth: '700px',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem,1.8vw,1.2rem)',
              color: 'rgba(255,255,255,.72)',
              lineHeight: 1.7,
              maxWidth: '580px',
              margin: '0 0 2.5rem',
            }}
          >
            {intro}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '12px',
                background: accent,
                padding: '13px 28px',
                fontWeight: 800,
                color: '#fff',
                textDecoration: 'none',
                boxShadow: `0 8px 28px ${accent}44`,
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Request a Quote →
            </Link>
            <Link
              to="/calculator"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,.25)',
                background: 'rgba(255,255,255,.08)',
                padding: '13px 28px',
                fontWeight: 700,
                color: '#fff',
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.18)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.08)')}
            >
              Try the Calculator
            </Link>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ background: '#fff', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Reveal style={{ marginBottom: '3.5rem' }}>
            <p
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: accent,
                marginBottom: '10px',
              }}
            >
              The Process
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.8rem,4vw,2.8rem)',
                fontWeight: 900,
                color: '#14202E',
                margin: '0 0 12px',
              }}
            >
              How it works
            </h2>
            <p style={{ fontSize: '1rem', color: '#5A6878', lineHeight: 1.7, maxWidth: '520px', margin: 0 }}>
              A clear, step-by-step process — no surprises, no hidden costs.
            </p>
          </Reveal>

          <div className="sp-steps">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <div
                  style={{
                    display: 'flex',
                    gap: '1.5rem',
                    paddingBottom: i < steps.length - 1 ? '2rem' : 0,
                    position: 'relative',
                  }}
                >
                  {/* connector */}
                  {i < steps.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '23px',
                        top: '52px',
                        bottom: 0,
                        width: '2px',
                        background: `linear-gradient(to bottom, ${accent}66, transparent)`,
                      }}
                    />
                  )}
                  {/* number */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: i === 0 ? accent : '#fff',
                      border: `2px solid ${accent}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: `0 0 0 5px ${accent}18`,
                      zIndex: 1,
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: i === 0 ? '#fff' : accent }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div style={{ paddingTop: '10px' }}>
                    <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800, color: '#14202E' }}>
                      {s.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#5A6878', lineHeight: 1.65 }}>
                      {s.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHAT YOU GET ══ */}
      <section style={{ background: '#F4F6F9', padding: '6rem 1.5rem', borderTop: '1px solid #E5E9EF' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: accent,
                marginBottom: '10px',
              }}
            >
              Deliverables
            </p>
            <h2
              style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, color: '#14202E', margin: 0 }}
            >
              What you get
            </h2>
          </Reveal>
          <div className="sp-gets">
            {gets.map((g, i) => (
              <Reveal key={g.title} delay={i * 70}>
                <div
                  style={{
                    borderRadius: '20px',
                    border: '1px solid #E5E9EF',
                    background: '#fff',
                    padding: '1.75rem',
                    height: '100%',
                    boxSizing: 'border-box',
                    transition: 'all .25s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = `0 16px 40px ${accent}18`;
                    e.currentTarget.style.borderColor = `${accent}44`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#E5E9EF';
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: `${accent}14`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                      marginBottom: '1.1rem',
                    }}
                  >
                    {g.icon}
                  </div>
                  <h4 style={{ margin: '0 0 7px', fontSize: '1rem', fontWeight: 800, color: '#14202E' }}>
                    {g.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#5A6878', lineHeight: 1.65 }}>
                    {g.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ EXTRA (optional) ══ */}
      {extra && (
        <section style={{ background: '#fff', padding: '6rem 1.5rem', borderTop: '1px solid #E5E9EF' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>{extra}</div>
        </section>
      )}

      {/* ══ OTHER SERVICES ══ */}
      <section style={{ background: '#0b1a0e', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <Reveal style={{ marginBottom: '3rem' }}>
            <p
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#F5A623',
                marginBottom: '10px',
              }}
            >
              Everything Solar
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, color: '#fff', margin: 0 }}>
              Our other services
            </h2>
          </Reveal>
          <div className="sp-others">
            {others.map((o, i) => (
              <Reveal key={o.to} delay={i * 80}>
                <Link
                  to={o.to}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,.1)',
                    background: 'rgba(255,255,255,.04)',
                    padding: '1.75rem',
                    textDecoration: 'none',
                    transition: 'all .25s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,.04)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>{o.icon}</span>
                  <div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                      {o.title}
                    </h4>
                    <p
                      style={{
                        margin: '0 0 10px',
                        fontSize: '0.875rem',
                        color: 'rgba(255,255,255,.55)',
                        lineHeight: 1.6,
                      }}
                    >
                      {o.text}
                    </p>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F5A623' }}>
                      Learn more →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section
        style={{ position: 'relative', background: '#14202E', padding: '7rem 1.5rem', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${accent}, #F5A623)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
          }}
        />
        <Reveal style={{ position: 'relative', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
          <h2
            style={{
              fontSize: 'clamp(2rem,5vw,3.5rem)',
              fontWeight: 900,
              color: '#fff',
              margin: '0 0 1rem',
              lineHeight: 1.1,
            }}
          >
            Ready to get started?
          </h2>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'rgba(255,255,255,.55)',
              lineHeight: 1.7,
              margin: '0 auto 2.5rem',
              maxWidth: '480px',
            }}
          >
            Request a free, no-obligation quote today. Our engineers will get back to you within 2 hours.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '14px',
                background: accent,
                padding: '15px 32px',
                fontWeight: 800,
                fontSize: '1rem',
                color: '#fff',
                textDecoration: 'none',
                boxShadow: `0 10px 32px ${accent}44`,
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.88';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'none';
              }}
            >
              Request a Free Quote →
            </Link>
            <Link
              to="/calculator"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,.2)',
                background: 'rgba(255,255,255,.06)',
                padding: '15px 32px',
                fontWeight: 700,
                fontSize: '1rem',
                color: '#fff',
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.14)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.06)')}
            >
              Use the Calculator
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
