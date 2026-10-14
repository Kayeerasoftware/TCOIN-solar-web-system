import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const STATS = [
  { end: 500, suffix: '+', label: 'Systems Installed' },
  { end: 10, suffix: '+', label: 'Years Experience' },
  { end: 98, suffix: '%', label: 'Client Satisfaction' },
  { end: 15, suffix: '+', label: 'Districts Served' },
];

const VALUES = [
  {
    icon: '🏅',
    title: 'Certified Engineers',
    text: 'Every job handled by trained, certified solar engineers with proven field experience.',
  },
  {
    icon: '🔒',
    title: 'Warranty Backed',
    text: 'Full manufacturer and workmanship warranties on every system we install.',
  },
  {
    icon: '📊',
    title: 'Data-Driven Sizing',
    text: 'Sized from your real appliance data — never oversold, never undersized.',
  },
  {
    icon: '🌍',
    title: 'Local Expertise',
    text: "Deep knowledge of Uganda's grid, climate, regulations and terrain.",
  },
];

const BRANDS = [
  'Victron Energy',
  'Pylontech',
  'JA Solar',
  'Growatt',
  'Schneider Electric',
  'Jinko Solar',
  'Canadian Solar',
  'BYD',
  'Felicity Solar',
];

const MILESTONES = [
  { year: '2014', text: 'TCOIN Center of Innovations founded in Kampala.' },
  { year: '2016', text: 'First commercial solar installation completed in Wakiso.' },
  { year: '2019', text: 'Expanded to 10+ districts across Uganda.' },
  { year: '2022', text: 'Crossed 300 systems installed; launched the online store.' },
  { year: '2024', text: '500+ systems, 98% client satisfaction, 24/7 support.' },
];

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
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

function Reveal({
  children,
  className = '',
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
}) {
  const { ref, vis } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : 'translateY(28px)',
        transition: `opacity .65s ease ${delay}ms, transform .65s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Counter({ end, suffix }: { end: number; suffix: string }) {
  const { ref, vis } = useReveal();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!vis) return;
    let raf: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 1600, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [vis, end]);
  return (
    <div
      ref={ref}
      style={{
        fontSize: '3rem',
        fontWeight: 900,
        color: '#F5A623',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
      }}
    >
      {val}
      {suffix}
    </div>
  );
}

const ABOUT_CSS = `
  .ab-stats   { display:grid; grid-template-columns:repeat(2,1fr); gap:2rem; }
  .ab-mv      { display:grid; grid-template-columns:1fr; gap:2px; border-radius:24px; overflow:hidden; }
  .ab-story   { display:grid; grid-template-columns:1fr; gap:3rem; align-items:center; }
  .ab-contact { display:grid; grid-template-columns:1fr; gap:2rem; }
  .ab-values  { display:grid; gap:1.5rem; grid-template-columns:1fr; }
  .ab-tl-row  { display:flex; gap:1rem; align-items:flex-start; }
  .ab-tl-line { display:block; width:2px; flex-shrink:0; background:linear-gradient(to bottom,#1D6434,#F5A623); margin-top:4px; align-self:stretch; }
  .ab-tl-dot  { width:44px; height:44px; border-radius:50%; background:#1D6434; border:3px solid #fff;
                box-shadow:0 0 0 3px rgba(29,100,52,.2); display:flex; align-items:center;
                justify-content:center; flex-shrink:0; }
  .ab-team-text { position:absolute; bottom:0; left:0; right:0; padding:2rem 1.5rem;
                  background:linear-gradient(to top,rgba(0,0,0,.85) 0%,transparent 100%); }
  @media(min-width:640px){
    .ab-stats   { grid-template-columns:repeat(4,1fr); }
    .ab-contact { grid-template-columns:repeat(3,1fr); }
    .ab-values  { grid-template-columns:repeat(2,1fr); }
  }
  @media(min-width:768px){
    .ab-mv    { grid-template-columns:repeat(3,1fr); }
    .ab-team-text { bottom:auto; top:50%; transform:translateY(-50%); left:8%; right:auto;
                    padding:0; background:none; max-width:480px; }
  }
  @media(min-width:1024px){
    .ab-story  { grid-template-columns:1fr 1fr; gap:5rem; }
    .ab-values { grid-template-columns:repeat(4,1fr); }
  }
`;

const LABEL: CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  color: '#1D6434',
  marginBottom: '12px',
};
const LABEL_LIGHT: CSSProperties = { ...LABEL, color: 'rgba(255,255,255,.5)' };
const LABEL_ORANGE: CSSProperties = { ...LABEL, color: '#F5A623' };
const H2: CSSProperties = {
  fontSize: 'clamp(2rem,4vw,3rem)',
  fontWeight: 900,
  lineHeight: 1.1,
  color: '#14202E',
  margin: '0 0 16px',
};
const H2_WHITE: CSSProperties = { ...H2, color: '#fff' };
const MUTED: CSSProperties = { fontSize: '1rem', color: '#5A6878', lineHeight: 1.7, margin: 0 };
const MUTED_WHITE: CSSProperties = { ...MUTED, color: 'rgba(255,255,255,.6)' };

export default function About() {
  useDocumentTitle('About');
  const p = useCompanyProfile();

  return (
    <div style={{ overflowX: 'hidden', background: '#fff' }}>
      <style>{ABOUT_CSS}</style>

      {/* ══ HERO ══ */}
      <section
        style={{
          position: 'relative',
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src="/Field photos/team.jpg"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(105deg, rgba(0,0,0,.88) 0%, rgba(0,0,0,.65) 55%, rgba(0,0,0,.3) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 50%)',
          }}
        />
        <img
          src="/brand/TCOIN LOGO OFFICIAL.svg"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: 0.07,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            maxWidth: '900px',
            margin: '0 auto',
            padding: '8rem 2rem 6rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '999px',
              border: '1px solid rgba(245,166,35,.4)',
              background: 'rgba(0,0,0,.35)',
              padding: '6px 18px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#F5A623',
              backdropFilter: 'blur(8px)',
              marginBottom: '2rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#F5A623',
                display: 'inline-block',
              }}
            />
            Est. 2014 · Kampala, Uganda
          </div>
          <h1
            style={{
              fontSize: 'clamp(2.8rem,7vw,5.5rem)',
              fontWeight: 900,
              lineHeight: 1.0,
              color: '#fff',
              margin: '0 0 1.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            Powering Uganda
            <br />
            <span style={{ color: '#F5A623' }}>with Solar</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem,1.8vw,1.25rem)',
              color: 'rgba(255,255,255,.72)',
              lineHeight: 1.7,
              maxWidth: '620px',
              margin: '0 auto 2.5rem',
            }}
          >
            {p.division} is the solar arm of {p.legal_name} — designing, installing and supporting solar
            systems for homes, businesses and institutions across Uganda since 2014.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '14px',
                background: '#F5A623',
                padding: '14px 30px',
                fontWeight: 800,
                color: '#fff',
                textDecoration: 'none',
                boxShadow: '0 8px 28px rgba(245,166,35,.3)',
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e09520';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F5A623';
                e.currentTarget.style.transform = 'none';
              }}
            >
              Get in Touch →
            </Link>
            <Link
              to="/projects"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,.25)',
                background: 'rgba(255,255,255,.08)',
                padding: '14px 30px',
                fontWeight: 700,
                color: '#fff',
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,.08)';
              }}
            >
              View Our Work
            </Link>
          </div>
        </div>

        {/* scroll cue */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            color: 'rgba(255,255,255,.35)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          <span>Scroll</span>
          <div
            style={{
              width: '1px',
              height: '40px',
              background: 'linear-gradient(to bottom, rgba(255,255,255,.35), transparent)',
            }}
          />
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section
        style={{ background: '#14202E', padding: '5rem 1.5rem', position: 'relative', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #1D6434, #F5A623, #3B3A93)',
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
        <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="ab-stats">
          {STATS.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 100}
              className="flex flex-col items-center gap-3 text-center"
              style={{ padding: '0 1rem' }}
            >
              <Counter end={s.end} suffix={s.suffix} />
              <p
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,.45)',
                  margin: 0,
                }}
              >
                {s.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ MISSION / VISION SPLIT ══ */}
      <section style={{ background: '#0b1a0e', padding: '7rem 1.5rem' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', gap: '2px' }} className="ab-mv">
          {/* Mission */}
          <div
            style={{
              background: '#1D6434',
              padding: '3.5rem 2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ fontSize: '2.5rem' }}>🎯</div>
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,.5)',
                margin: 0,
              }}
            >
              Our Mission
            </p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.2 }}>
              Make clean energy accessible to every Ugandan.
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,.65)', lineHeight: 1.7, margin: 0 }}>
              We deliver affordable, reliable solar solutions — from a single home to an entire institution —
              backed by engineering expertise and honest pricing.
            </p>
          </div>
          {/* Centre photo */}
          <div style={{ position: 'relative', minHeight: '380px', overflow: 'hidden' }}>
            <img
              src="/Field photos/showin system stright.jpg"
              alt="TCOIN Solar installation"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.6) 100%)',
              }}
            />
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#F5A623',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Real installations
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,.8)' }}>
                Every photo is a real TCOIN Solar project.
              </p>
            </div>
          </div>
          {/* Vision */}
          <div
            style={{
              background: '#155228',
              padding: '3.5rem 2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ fontSize: '2.5rem' }}>🌅</div>
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,.5)',
                margin: 0,
              }}
            >
              Our Vision
            </p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.2 }}>
              A solar-powered East Africa.
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,.65)', lineHeight: 1.7, margin: 0 }}>
              We see a future where every home, school and clinic runs on clean, locally-generated solar power
              — and we're building it one system at a time.
            </p>
          </div>
        </div>
      </section>

      {/* ══ OUR STORY ══ */}
      <section style={{ background: '#fff', padding: '7rem 1.5rem' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }} className="ab-story">
          {/* text */}
          <Reveal>
            <p style={LABEL}>Our Story</p>
            <h2 style={H2}>From a workshop in Kampala to 500+ systems.</h2>
            <p style={{ ...MUTED, marginBottom: '1.5rem' }}>
              {p.legal_name} was founded with a single belief: that innovation should serve people. The solar
              division grew out of the demand we saw every day — homes and businesses crippled by unreliable
              grid power and expensive generators.
            </p>
            <p style={{ ...MUTED, marginBottom: '2rem' }}>
              Today {p.division} designs, supplies and installs complete hybrid solar systems across Uganda,
              with a team of certified engineers and a workshop stocked with tier-1 components.
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {p.what_we_do.map((item) => (
                <li
                  key={item}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    fontSize: '0.9rem',
                    color: '#5A6878',
                    lineHeight: 1.6,
                  }}
                >
                  <span style={{ color: '#1D6434', fontWeight: 900, flexShrink: 0, marginTop: '2px' }}>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* bento photos */}
          <Reveal delay={120}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: 'clamp(140px,28vw,220px) clamp(110px,22vw,180px)',
                gap: '10px',
              }}
            >
              <div style={{ gridColumn: '1 / 3', borderRadius: '18px', overflow: 'hidden' }}>
                <img
                  src="/Field photos/panels.jpg"
                  alt="Solar panels"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform .6s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                />
              </div>
              <div style={{ borderRadius: '18px', overflow: 'hidden' }}>
                <img
                  src="/Field photos/wiring.jpg"
                  alt="Wiring"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform .6s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                />
              </div>
              <div style={{ borderRadius: '18px', overflow: 'hidden' }}>
                <img
                  src="/Field photos/work progress.jpg"
                  alt="Work in progress"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform .6s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ TIMELINE ══ */}
      <section style={{ background: '#F4F6F9', padding: '7rem 1.5rem', borderTop: '1px solid #D9DEE5' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={LABEL}>Our Journey</p>
            <h2 style={{ ...H2, textAlign: 'center' }}>A decade of solar in Uganda</h2>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {MILESTONES.map((m, i) => (
              <Reveal key={m.year} delay={i * 80}>
                <div className="ab-tl-row">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="ab-tl-dot">
                      <span
                        style={{
                          fontSize: '0.6rem',
                          fontWeight: 900,
                          color: '#fff',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {m.year}
                      </span>
                    </div>
                    {i < MILESTONES.length - 1 && <div className="ab-tl-line" style={{ height: '2.5rem' }} />}
                  </div>
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: '16px',
                      border: '1px solid #D9DEE5',
                      padding: '1rem 1.25rem',
                      boxShadow: '0 4px 16px rgba(0,0,0,.06)',
                      flex: 1,
                      marginBottom: i < MILESTONES.length - 1 ? '0.5rem' : 0,
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#5A6878', lineHeight: 1.6 }}>
                      {m.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ VALUES ══ */}
      <section style={{ background: '#fff', padding: '7rem 1.5rem' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={LABEL}>What We Stand For</p>
            <h2 style={{ ...H2, textAlign: 'center' }}>The TCOIN difference</h2>
            <p style={{ ...MUTED, textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
              We don't just sell solar — we engineer, install and support it for life.
            </p>
          </Reveal>
          <div className="ab-values" style={{ gap: '1.5rem' }}>
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div
                  style={{
                    borderRadius: '20px',
                    border: '1px solid #D9DEE5',
                    background: '#F4F6F9',
                    padding: '1.75rem',
                    height: '100%',
                    boxSizing: 'border-box',
                    transition: 'all .25s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 20px 48px rgba(29,100,52,.1)';
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = 'rgba(29,100,52,.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = '#F4F6F9';
                    e.currentTarget.style.borderColor = '#D9DEE5';
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(29,100,52,.12), rgba(59,58,147,.08))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.75rem',
                      marginBottom: '1.2rem',
                    }}
                  >
                    {v.icon}
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#14202E', margin: '0 0 8px' }}>
                    {v.title}
                  </h4>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: '#5A6878', margin: 0 }}>
                    {v.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TEAM PHOTO FULL-WIDTH ══ */}
      <section style={{ position: 'relative', minHeight: '360px', overflow: 'hidden' }}>
        <img
          src="/Field photos/team.jpg"
          alt="The TCOIN Solar team"
          style={{
            width: '100%',
            height: '100%',
            minHeight: '360px',
            objectFit: 'cover',
            objectPosition: 'center 40%',
            display: 'block',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.4) 60%, transparent 100%)',
          }}
        />
        <Reveal className="ab-team-text">
          <p style={LABEL_LIGHT}>Our People</p>
          <h2 style={{ ...H2_WHITE, marginBottom: '1rem' }}>Certified engineers. Real results.</h2>
          <p style={MUTED_WHITE}>
            Our team handles every project from site survey to commissioning — with safety checklists on every
            job.
          </p>
        </Reveal>
      </section>

      {/* ══ TRUSTED BRANDS ══ */}
      <section
        style={{
          background: '#F4F6F9',
          padding: '3.5rem 1.5rem',
          borderTop: '1px solid #D9DEE5',
          borderBottom: '1px solid #D9DEE5',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#5A6878',
              marginBottom: '2rem',
            }}
          >
            Trusted Brands We Install
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1.5rem 3rem',
              alignItems: 'center',
            }}
          >
            {BRANDS.map((name) => (
              <span
                key={name}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#14202E',
                  opacity: 0.4,
                  letterSpacing: '0.04em',
                  transition: 'opacity .2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.4')}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACT STRIP ══ */}
      <section style={{ background: '#fff', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="ab-contact">
          {[
            { icon: '📍', label: 'Find Us', lines: [p.address, p.po_box] },
            { icon: '📞', label: 'Call Us', lines: [p.tel, p.mobile, ...(p.hotlines ?? [])] },
            { icon: '✉️', label: 'Email Us', lines: [p.email, p.web] },
          ].map((item, i) => (
            <Reveal key={item.label} delay={i * 80}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'rgba(29,100,52,.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <p
                    style={{
                      margin: '0 0 6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: '#1D6434',
                    }}
                  >
                    {item.label}
                  </p>
                  {item.lines.map((l) => (
                    <p key={l} style={{ margin: '0 0 2px', fontSize: '0.9rem', color: '#5A6878' }}>
                      {l}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section
        style={{ position: 'relative', background: '#0b1a0e', padding: '8rem 1.5rem', overflow: 'hidden' }}
      >
        <img
          src="/Field photos/showin system side.jpg"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.18,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(105deg, #0b1a0e 0%, rgba(11,26,14,.88) 50%, rgba(11,26,14,.6) 100%)',
          }}
        />
        <Reveal style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <p style={LABEL_ORANGE}>Work With Us</p>
          <h2
            style={{
              fontSize: 'clamp(2.5rem,6vw,4rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              color: '#fff',
              margin: '0 0 1.25rem',
            }}
          >
            Ready to go solar?
          </h2>
          <p
            style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,.55)',
              maxWidth: '500px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            Join hundreds of Ugandan homes and businesses already saving with {p.division_short}. Call us on{' '}
            <a href={`tel:${p.mobile}`} style={{ color: '#F5A623', fontWeight: 700, textDecoration: 'none' }}>
              {p.mobile}
            </a>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '14px',
                background: '#F5A623',
                padding: '16px 32px',
                fontWeight: 800,
                fontSize: '1rem',
                color: '#fff',
                textDecoration: 'none',
                boxShadow: '0 10px 32px rgba(245,166,35,.25)',
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e09520';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F5A623';
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
                padding: '16px 32px',
                fontWeight: 700,
                fontSize: '1rem',
                color: '#fff',
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,.14)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,.06)';
              }}
            >
              Use the Calculator
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
