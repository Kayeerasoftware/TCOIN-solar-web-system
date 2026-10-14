import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const SERVICES = [
  {
    to: '/services/design',
    icon: '📐',
    title: 'System Design',
    text: 'Site survey, sizing, single-line diagrams and a priced bill of materials.',
  },
  {
    to: '/services/installation',
    icon: '⚡',
    title: 'Installation',
    text: 'Certified crews, safety checklists and commissioning records.',
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

const STATS = [
  { end: 500, suffix: '+', label: 'Systems Installed' },
  { end: 10, suffix: '+', label: 'Years Experience' },
  { end: 98, suffix: '%', label: 'Client Satisfaction' },
  { end: 24, suffix: '/7', label: 'Support Available' },
];

const TESTIMONIALS = [
  {
    name: 'James Mukasa',
    role: 'Home Owner, Kampala',
    quote: 'My electricity bill dropped by 80%. The TCOIN team was professional from survey to switch-on.',
  },
  {
    name: 'Grace Nakato',
    role: 'Business Owner, Entebbe',
    quote: 'No more generator costs. The system has been running flawlessly for two years.',
  },
  {
    name: 'Dr. Paul Ssemanda',
    role: 'Clinic Director, Wakiso',
    quote: 'Critical medical equipment now runs 24/7. TCOIN delivered exactly what they promised.',
  },
];

const WHY = [
  {
    icon: '🏅',
    title: 'Certified Engineers',
    text: 'Every job handled by trained, certified solar engineers.',
  },
  {
    icon: '🔒',
    title: 'Warranty Backed',
    text: 'Full manufacturer and workmanship warranties on every system.',
  },
  { icon: '📊', title: 'Data-Driven Sizing', text: 'Sized from your real appliance data — never oversold.' },
  { icon: '🌍', title: 'Local Expertise', text: "Deep knowledge of Uganda's grid, climate and regulations." },
];

const STEPS = [
  {
    n: '01',
    title: 'Free Site Survey',
    text: 'We visit your property, assess your energy needs and take measurements — at no cost.',
  },
  {
    n: '02',
    title: 'Custom Design',
    text: 'Our engineers produce a sized system design with a transparent, itemised quote.',
  },
  {
    n: '03',
    title: 'Installation',
    text: 'Certified crews install and commission your system, usually within one day.',
  },
  {
    n: '04',
    title: 'Ongoing Support',
    text: 'Remote monitoring, annual service visits and a direct line to our engineers.',
  },
];

const LOGOS = ['Victron Energy', 'Pylontech', 'JA Solar', 'Growatt', 'Schneider Electric'];

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

/* ───────────── HERO (front screen) ───────────── */

/** Box 1 to 7: project photos that drift left. Seven distinct photos, shown twice for a seamless loop. */
const PROJECT_TILES = [
  { src: '/Field photos/panels.jpg', label: 'Rooftop array' },
  { src: '/Field photos/team.jpg', label: 'Our team' },
  { src: '/Field photos/system.jpg', label: 'Completed system' },
  { src: '/Field photos/wiring.jpg', label: 'Wiring and protection' },
  { src: '/Field photos/showin system side.jpg', label: 'System, side view' },
  { src: '/Field photos/work progress.jpg', label: 'Work in progress' },
  { src: '/Field photos/showin system stright.jpg', label: 'System, front view' },
];

/** Box 8: put your AI-generated image of a perfect completed system here (see the placeholder text on screen). */
const AI_SYSTEM_IMAGE = '/brand/Hybrid Solar System Infographic.png';

/** Box 9: bold words and descriptions that appear one after another in the same place. */
const HERO_SLIDES: { words: string[]; accent: number[]; desc: string }[] = [
  {
    words: ['POWER', 'YOUR', 'FUTURE', 'WITH', 'SOLAR'],
    accent: [2],
    desc: 'Design, installation, maintenance and consultancy — all from one expert team in Kampala.',
  },
  ...SERVICES.map((s) => {
    const words = s.title.toUpperCase().split(' ');
    return { words, accent: [words.length - 1], desc: s.text };
  }),
  {
    words: ['SOLAR', 'COMPONENTS'],
    accent: [1],
    desc: 'Panels, inverters, batteries and installation materials — supplied by TCOIN with warranty.',
  },
];
const HERO_SLIDE_MS = 4200;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function HeroTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setInterval(() => setI((n) => (n + 1) % HERO_SLIDES.length), HERO_SLIDE_MS);
    return () => clearInterval(t);
  }, []);
  const s = HERO_SLIDES[i];
  return (
    <div
      className="th-ticker"
      role="group"
      aria-roledescription="carousel"
      aria-label="What TCOIN Solar offers"
    >
      {/* key remounts the block so the entrance animation replays for every slide */}
      <div key={i} aria-live="off" aria-atomic="true">
        <h2 className="th-words">
          {s.words.map((w, k) => (
            <span
              key={k}
              className="th-word"
              style={{ animationDelay: `${k * 140}ms`, color: s.accent.includes(k) ? '#F5A623' : '#fff' }}
            >
              {w}
            </span>
          ))}
        </h2>
        <p className="th-desc" style={{ animationDelay: `${s.words.length * 140 + 120}ms` }}>
          {s.desc}
        </p>
        <span className="th-progress" aria-hidden />
      </div>
      <div className="th-dots">
        {HERO_SLIDES.map((_, k) => (
          <button
            key={k}
            type="button"
            className="th-dot"
            aria-label={`Show message ${k + 1} of ${HERO_SLIDES.length}`}
            aria-current={k === i}
            onClick={() => setI(k)}
          />
        ))}
      </div>
    </div>
  );
}

function AiSystemShowcase() {
  const [missing, setMissing] = useState(false);
  return (
    <figure className="th-ai">
      {!missing && (
        <img
          src={AI_SYSTEM_IMAGE}
          alt="Completed TCOIN Solar system (AI-generated illustration)"
          onError={() => setMissing(true)}
        />
      )}
      {missing && (
        <div
          className="th-ai-ph"
          role="img"
          aria-label="Placeholder for an AI-generated image of a perfect completed solar system"
        >
          <svg viewBox="0 0 160 110" width="150" height="103" aria-hidden>
            <circle cx="132" cy="22" r="13" fill="#F5A623" />
            {[0, 1, 2].map((r) =>
              [0, 1, 2, 3].map((c) => (
                <polygon
                  key={`${r}-${c}`}
                  points={`${18 + c * 31 - r * 5},${48 + r * 17} ${46 + c * 31 - r * 5},${48 + r * 17} ${42 + c * 31 - r * 5},${62 + r * 17} ${14 + c * 31 - r * 5},${62 + r * 17}`}
                  fill="rgba(74,222,128,.22)"
                  stroke="#4ade80"
                  strokeWidth="1.2"
                />
              )),
            )}
          </svg>
          <strong>AI-generated completed solar system</strong>
          <span>
            Placeholder. Add your image as <code>public/hero/ai-solar-system.jpg</code>
          </span>
        </div>
      )}
    </figure>
  );
}

function ProjectStrip() {
  const loop = [...PROJECT_TILES, ...PROJECT_TILES];
  return (
    <div className="th-strip" aria-label="Recent TCOIN Solar projects">
      <div className="th-viewport">
        <div className="th-track">
          {loop.map((t, k) => {
            const clone = k >= PROJECT_TILES.length;
            return (
              <figure
                key={k}
                className="th-tile"
                aria-hidden={clone || undefined}
                data-testid={clone ? 'project-tile-clone' : 'project-tile'}
              >
                <img src={t.src} alt={clone ? '' : t.label} draggable={false} />
                <figcaption>{t.label}</figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const BRAND_TITLE = 'TCOIN Center of Innovations';

const HERO_CSS = `
  .th-hero { position: relative; height: 100vh; min-height: 700px; display: flex; flex-direction: column; margin-top: -32px; }
  .th-grid { position: relative; z-index: 2; flex: 1; min-height: 0; display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1.15fr) 272px; grid-template-rows: auto 1fr auto;
    gap: 10px 2.2rem; padding: 104px 2.5rem 0; box-sizing: border-box; }
  .th-title { grid-column: 1 / 4; grid-row: 1; align-self: end; display: flex; justify-content: center; }
  .th-brand-title { display: flex; align-items: center; justify-content: center;
    font-size: clamp(1rem, 2.2vw, 1.9rem); font-weight: 600; letter-spacing: 0.55em;
    text-transform: uppercase; line-height: 1; white-space: nowrap;
    color: #fff; position: relative; padding-bottom: 10px;
    font-family: 'Georgia', 'Times New Roman', serif; }
  .th-brand-title::after { content: ''; position: absolute; left: 0; bottom: 0;
    height: 1px; width: 100%;
    background: linear-gradient(90deg, transparent, rgba(245,166,35,.5), transparent);
    opacity: 0.6; }
  .th-brand-char { display: inline-block; color: rgba(255,255,255,0.5); }
  .th-brand-space { display: inline-block; width: .28em; }
  .th-ai { grid-column: 1; grid-row: 2 / 4; }
  .th-solar-row { grid-column: 2; grid-row: 2; align-self: start; padding-top: 18px; container-type: inline-size; }
  .th-center { grid-column: 2; grid-row: 3; display: flex; flex-direction: column; gap: 12px; min-height: 0; align-self: end; }
  .th-calc { grid-column: 3; grid-row: 2 / 4; align-self: stretch; }

  /* box 8 */
  .th-ai { position: relative; margin: 0; min-height: 0; border-radius: 22px; overflow: hidden;
    border: 1px solid rgba(255,255,255,.18); box-shadow: 0 20px 50px rgba(0,0,0,.5);
    background: linear-gradient(160deg, #10301b, #06150b); }
  .th-ai > img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .th-ai-ph { position: absolute; inset: 14px; border: 2px dashed rgba(74,222,128,.45); border-radius: 16px;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
    text-align: center; padding: 1rem; color: rgba(255,255,255,.8); font-size: .85rem; }
  .th-ai-ph strong { color: #4ade80; font-size: 1rem; }
  .th-ai-ph code { background: rgba(255,255,255,.1); padding: 1px 6px; border-radius: 4px; }
  .th-ai figcaption { position: absolute; left: 0; right: 0; bottom: 0; padding: 28px 16px 12px; font-size: .78rem;
    color: rgba(255,255,255,.85); background: linear-gradient(to top, rgba(0,0,0,.75), transparent); pointer-events: none; }
  .th-badge { position: absolute; top: 14px; left: 14px; display: inline-flex; align-items: center; gap: 8px;
    border-radius: 999px; border: 1px solid rgba(245,166,35,.45); background: rgba(0,0,0,.45);
    padding: 6px 14px; font-size: .8rem; font-weight: 600; color: #F5A623; backdrop-filter: blur(8px); }
  .th-badge-dot { width: 8px; height: 8px; border-radius: 50%; background: #F5A623; animation: pulse 2s infinite; }

  /* SOLAR DEPT */
  .th-solar { margin: 0; font-weight: 900; text-transform: uppercase; letter-spacing: -.02em; line-height: .95;
    color: transparent; text-shadow: none; width: 100%; display: block;
    white-space: nowrap; font-size: 17cqi;
    -webkit-text-stroke: 2px rgba(245,166,35,0.55);
    background: linear-gradient(135deg, rgba(245,166,35,0.7) 0%, rgba(255,255,255,0.15) 60%, rgba(245,166,35,0.4) 100%);
    -webkit-background-clip: text; background-clip: text; }
  .th-solar span { color: inherit; -webkit-text-stroke: inherit; }

  /* box 9 */
  .th-ticker { position: relative; overflow: hidden; display: flex; flex-direction: column;
    justify-content: center; border-radius: 20px; border: 1px solid rgba(255,255,255,.14);
    background: linear-gradient(160deg, rgba(10,24,14,.74), rgba(0,0,0,.55)); backdrop-filter: blur(10px);
    box-shadow: 0 20px 50px rgba(0,0,0,.45); padding: clamp(14px, 1.8vw, 24px);
    height: 220px; flex-shrink: 0; }
  .th-words { margin: 0; display: flex; flex-wrap: wrap; gap: 0 .28em; font-weight: 900; text-transform: uppercase;
    line-height: 1.02; letter-spacing: -0.01em; font-size: clamp(1rem, min(1.9vw, 4.5vh), 2rem); }
  .th-word { display: inline-block; opacity: 0; transform: translateY(.6em);
    animation: th-rise .55s cubic-bezier(.2,.7,.2,1) forwards; }
  .th-desc { margin: 1rem 0 0; opacity: 0; animation: th-fade .6s ease forwards; line-height: 1.6;
    font-size: clamp(.9rem, 1.1vw, 1.15rem); color: rgba(255,255,255,.8); max-width: 34em; }
  .th-progress { position: absolute; left: 0; bottom: 0; height: 3px; background: #F5A623;
    animation: th-prog ${HERO_SLIDE_MS}ms linear forwards; }
  .th-dots { position: absolute; right: 18px; top: 16px; display: flex; gap: 8px; }
  .th-dot { width: 8px; height: 8px; border-radius: 4px; border: 0; padding: 0; cursor: pointer;
    background: rgba(255,255,255,.3); transition: all .3s; }
  .th-dot[aria-current='true'] { width: 26px; background: #F5A623; }
  .th-ctas { display: flex; flex-wrap: nowrap; align-items: center; gap: 10px 12px; }
  .th-cta { display: inline-flex; align-items: center; gap: 8px; border-radius: 8px; padding: 13px 22px;
    font-weight: 700; font-size: .92rem; color: #fff; text-decoration: none; transition: all .15s ease;
    letter-spacing: .01em; white-space: nowrap; cursor: pointer; position: relative; overflow: hidden; }
  .th-cta-main {
    background: linear-gradient(180deg, #3a3a3a 0%, #1a1a1a 100%);
    border: 1px solid #000;
    box-shadow: 0 1px 0 rgba(255,255,255,.12) inset, 0 4px 0 #000, 0 5px 10px rgba(0,0,0,.5);
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,.6);
  }
  .th-cta-main:hover {
    background: linear-gradient(180deg, #444 0%, #222 100%);
    box-shadow: 0 1px 0 rgba(255,255,255,.12) inset, 0 5px 0 #000, 0 7px 14px rgba(0,0,0,.55);
    transform: translateY(-1px);
  }
  .th-cta-main:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(255,255,255,.08) inset, 0 1px 0 #000, 0 2px 4px rgba(0,0,0,.4); }
  .th-cta-ghost {
    background: linear-gradient(180deg, #3a3a3a 0%, #1a1a1a 100%);
    border: 1px solid #000;
    box-shadow: 0 1px 0 rgba(255,255,255,.12) inset, 0 4px 0 #000, 0 5px 10px rgba(0,0,0,.5);
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,.6);
  }
  .th-cta-ghost:hover {
    background: linear-gradient(180deg, #444 0%, #222 100%);
    transform: translateY(-1px);
    box-shadow: 0 1px 0 rgba(255,255,255,.12) inset, 0 5px 0 #000, 0 7px 14px rgba(0,0,0,.55);
  }
  .th-cta-ghost:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(255,255,255,.08) inset, 0 1px 0 #000, 0 2px 4px rgba(0,0,0,.4); }
  .th-checks { display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: .78rem; color: rgba(255,255,255,.55); }

  /* boxes 1 to 7 */
  .th-strip { position: relative; z-index: 2; padding: 14px 2.5rem 18px; }
  .th-viewport { overflow: hidden; container-type: inline-size; border-radius: 16px; }
  .th-track { display: flex; width: max-content; animation: th-marquee 42s linear infinite; }
  .th-strip:hover .th-track { animation-play-state: paused; }
  .th-tile { position: relative; margin: 0 14px 0 0; flex: 0 0 150px; flex: 0 0 calc((100cqw - 84px) / 7);
    height: clamp(86px, 15.5vh, 170px); border-radius: 14px; overflow: hidden;
    border: 1px solid rgba(255,255,255,.2); box-shadow: 0 10px 28px rgba(0,0,0,.45); }
  .th-tile img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .6s ease; }
  .th-tile:hover img { transform: scale(1.06); }
  .th-tile figcaption { position: absolute; left: 0; right: 0; bottom: 0; padding: 18px 10px 7px; font-size: .68rem;
    font-weight: 600; color: #fff; background: linear-gradient(to top, rgba(0,0,0,.78), transparent); }

  @keyframes th-rise { to { opacity: 1; transform: none; } }
  @keyframes th-fade { to { opacity: 1; } }
  @keyframes th-prog { from { width: 0; } to { width: 100%; } }
  @keyframes th-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  @media (max-width: 1100px) {
    .th-hero { height: auto; }
    .th-grid { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto; padding-top: 100px; gap: 18px; }
    .th-title, .th-ai, .th-center, .th-calc { grid-column: 1; grid-row: auto; }
    .th-title { overflow: hidden; }
    .th-ai { height: 300px; }
    .th-center { min-height: 340px; }
    .th-calc { max-width: 340px; width: 100%; justify-self: center; }
    .th-tile { height: 110px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .th-track { animation: none; }
    .th-word, .th-desc { animation: none; opacity: 1; transform: none; }
    .th-progress { display: none; }
  }
`;

export default function Home() {
  useDocumentTitle('Home');
  const navigate = useNavigate();
  const p = useCompanyProfile();
  const [bill, setBill] = useState('');
  const [tIdx, setTIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTIdx((i) => (i + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ overflowX: 'hidden', background: '#fff' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        ${HERO_CSS}
      `}</style>

      {/* ══ HERO ══ */}
      <section className="th-hero" aria-label="TCOIN Solar Dept">
        {/* watermark logo */}
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
            opacity: 0.2,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        <img
          src="/Field photos/panels.jpg"
          alt="Solar panels installed by TCOIN Solar"
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
              'linear-gradient(105deg, rgba(0,0,0,.92) 0%, rgba(0,0,0,.6) 55%, rgba(0,0,0,.15) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,.75) 0%, transparent 55%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '5%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(29,100,52,.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* ── FRONT SCREEN: everything below fits in the first viewport ── */}
        <div className="th-grid">
          {/* title row */}
          <div className="th-title">
            <h2 className="th-brand-title" aria-label={BRAND_TITLE}>
              {BRAND_TITLE.split('').map((ch, i) =>
                ch === ' ' ? (
                  <span key={i} className="th-brand-space" aria-hidden />
                ) : (
                  <span
                    key={i}
                    className="th-brand-char"
                    aria-hidden
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {ch}
                  </span>
                ),
              )}
            </h2>
          </div>

          {/* box 8: AI-generated completed system (placeholder until the image is added) */}
          <AiSystemShowcase />

          {/* SOLAR DEPT — decoupled, sits in its own row */}
          <div className="th-solar-row">
            <h1 className="th-solar">
              SOLAR <span>DEPT</span>
            </h1>
          </div>

          {/* box 9 (animated words) + buttons */}
          <div className="th-center">
            <HeroTicker />
            <div className="th-ctas">
              <Link to="/calculator" className="th-cta th-cta-main">
                Get Free Estimate →
              </Link>
              <Link to="/store" className="th-cta th-cta-ghost">
                Shop Components
              </Link>
            </div>
            <div className="th-checks">
              {['Free site survey', '5-year warranty', 'Flexible financing'].map((t) => (
                <span key={t}>
                  <span style={{ color: '#F5A623' }}>✓</span> {t}
                </span>
              ))}
            </div>
          </div>

          {/* calculator (unchanged) */}
          <div className="th-calc">
            <div
              style={{
                height: '100%',
                borderRadius: '24px',
                background: 'linear-gradient(160deg, #1a2a1e 0%, #0d1a10 100%)',
                border: '1.5px solid rgba(255,255,255,.1)',
                boxShadow: '0 24px 60px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.08)',
                padding: '16px 15px 18px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* grille dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '10px' }}>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '3px',
                      height: '3px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,.18)',
                    }}
                  />
                ))}
              </div>
              {/* brand */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  marginBottom: '8px',
                }}
              >
                <img
                  src="/brand/TCOIN LOGO OFFICIAL.svg"
                  alt="TCOIN"
                  style={{ height: '22px', width: 'auto', opacity: 0.85 }}
                />
                <span
                  style={{
                    fontSize: '0.52rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    color: 'rgba(255,255,255,.28)',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                  }}
                >
                  TCOIN SOLAR UGANDA
                </span>
              </div>
              {/* LCD */}
              <div
                style={{
                  borderRadius: '10px',
                  background: '#071409',
                  border: '2px solid #0d2610',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,.7), 0 0 0 1px rgba(29,100,52,.25)',
                  padding: '10px 13px',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.55rem',
                    color: 'rgba(74,222,128,.4)',
                    fontFamily: 'monospace',
                    marginBottom: '3px',
                    letterSpacing: '0.06em',
                  }}
                >
                  MONTHLY FACILITY ELECTRICITY BILL (UGX)
                </div>
                <div
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 900,
                    color: '#4ade80',
                    fontFamily: 'monospace',
                    textShadow: '0 0 10px rgba(74,222,128,.35)',
                    lineHeight: 1.1,
                  }}
                >
                  {bill ? Number(bill).toLocaleString() : '0'}
                </div>
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#4ade80',
                      boxShadow: '0 0 5px #4ade80',
                      animation: 'pulse 2s infinite',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.5rem',
                      color: 'rgba(74,222,128,.45)',
                      fontFamily: 'monospace',
                      letterSpacing: '0.1em',
                    }}
                  >
                    READY
                  </span>
                </div>
              </div>
              {/* form */}
              <form
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate(`/calculator?bill=${bill}`);
                }}
              >
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <input
                    inputMode="numeric"
                    value={bill}
                    onChange={(e) => setBill(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="Type your bill…"
                    aria-label="Monthly electricity bill in UGX"
                    style={{
                      width: '100%',
                      borderRadius: '7px',
                      border: '1px solid rgba(29,100,52,.4)',
                      background: 'rgba(29,100,52,.15)',
                      padding: '8px 52px 8px 10px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'monospace',
                    }}
                  />
                  {bill && (
                    <button
                      type="button"
                      onClick={() => setBill('')}
                      style={{
                        position: 'absolute',
                        right: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        borderRadius: '5px',
                        border: '1px solid rgba(255,255,255,.15)',
                        background: 'rgba(255,255,255,.08)',
                        color: 'rgba(255,255,255,.55)',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '3px 7px',
                        cursor: 'pointer',
                        letterSpacing: '0.05em',
                      }}
                    >
                      DEL
                    </button>
                  )}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3,1fr)',
                    gap: '5px',
                    marginBottom: '8px',
                    flex: 1,
                    alignContent: 'start',
                  }}
                >
                  {[
                    '150k',
                    '300k',
                    '450k',
                    '600k',
                    '750k',
                    '900k',
                    '1.1M',
                    '1.2M',
                    '1.5M',
                    '1.8M',
                    '2M',
                    '2.5M',
                  ].map((label) => {
                    const val = label.endsWith('M')
                      ? String(parseFloat(label) * 1_000_000)
                      : String(parseInt(label) * 1000);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setBill(val)}
                        style={{
                          borderRadius: '6px',
                          border: '1px solid rgba(29,100,52,.35)',
                          background: bill === val ? 'rgba(29,100,52,.5)' : 'rgba(255,255,255,.05)',
                          color: bill === val ? '#4ade80' : 'rgba(255,255,255,.5)',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '5px 0',
                          cursor: 'pointer',
                          transition: 'all .15s',
                          fontFamily: 'monospace',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    borderRadius: '9px',
                    background: 'linear-gradient(135deg, #1D6434 0%, #155228 100%)',
                    border: '1px solid rgba(29,100,52,.6)',
                    padding: '10px',
                    fontWeight: 700,
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(29,100,52,.4), inset 0 1px 0 rgba(255,255,255,.1)',
                    transition: 'all .2s',
                    letterSpacing: '0.03em',
                    whiteSpace: 'nowrap',
                    fontSize: '0.72rem',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      '0 6px 20px rgba(29,100,52,.6), inset 0 1px 0 rgba(255,255,255,.1)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow =
                      '0 4px 14px rgba(29,100,52,.4), inset 0 1px 0 rgba(255,255,255,.1)')
                  }
                >
                  Calculate Savings | System Size | Cost
                </button>
              </form>
              <p
                style={{
                  marginTop: '10px',
                  textAlign: 'center',
                  fontSize: '0.6rem',
                  color: 'rgba(255,255,255,.22)',
                }}
              >
                Or{' '}
                <Link to="/contact" style={{ color: '#4ade80', textDecoration: 'none' }}>
                  speak to an engineer | Technician
                </Link>
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '12px',
                  padding: '0 3px',
                }}
              >
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,.08)',
                      border: '1px solid rgba(255,255,255,.05)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* boxes 1 to 7: project photos moving left */}
        <ProjectStrip />
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
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: '2rem',
          }}
          className="grid-cols-2 sm:grid-cols-4"
        >
          {STATS.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 100}
              className="flex flex-col items-center gap-3 text-center"
              style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,.08)' : 'none', padding: '0 1rem' }}
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

      {/* ══ SERVICES ══ */}
      <section
        style={{ background: '#fff', padding: '7rem 1.5rem', position: 'relative', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-160px',
            right: '-160px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(29,100,52,.04)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <Reveal style={{ maxWidth: '520px', marginBottom: '4rem' }}>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#1D6434',
                marginBottom: '12px',
              }}
            >
              What We Offer
            </p>
            <h2
              style={{
                fontSize: 'clamp(2rem,4vw,3rem)',
                fontWeight: 900,
                lineHeight: 1.1,
                color: '#14202E',
                margin: '0 0 16px',
              }}
            >
              Everything solar,
              <br />
              under one roof.
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#5A6878', lineHeight: 1.7, margin: 0 }}>
              We handle every stage so you never need to coordinate multiple contractors.
            </p>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s, i) => (
              <Reveal key={s.to} delay={i * 80}>
                <Link
                  to={s.to}
                  style={{
                    display: 'block',
                    borderRadius: '20px',
                    border: '1px solid #D9DEE5',
                    borderTop: '3px solid transparent',
                    background: '#F4F6F9',
                    padding: '1.75rem',
                    textDecoration: 'none',
                    transition: 'all .25s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 20px 48px rgba(29,100,52,.12)';
                    e.currentTarget.style.borderColor = 'rgba(29,100,52,.3)';
                    e.currentTarget.style.borderTopColor = '#1D6434';
                    e.currentTarget.style.background = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#D9DEE5';
                    e.currentTarget.style.borderTopColor = 'transparent';
                    e.currentTarget.style.background = '#F4F6F9';
                  }}
                >
                  <span style={{ fontSize: '2.8rem' }}>{s.icon}</span>
                  <h3 style={{ marginTop: '1.2rem', fontSize: '1.1rem', fontWeight: 800, color: '#14202E' }}>
                    {s.title}
                  </h3>
                  <p style={{ marginTop: '8px', fontSize: '0.875rem', lineHeight: 1.65, color: '#5A6878' }}>
                    {s.text}
                  </p>
                  <p style={{ marginTop: '1rem', fontSize: '0.85rem', fontWeight: 700, color: '#1D6434' }}>
                    Learn more →
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BENTO PHOTO GRID ══ */}
      <section style={{ background: '#0b1a0e', padding: '7rem 1.5rem' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#F5A623',
                marginBottom: '12px',
              }}
            >
              Our Work
            </p>
            <h2
              style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, color: '#fff', margin: '0 0 12px' }}
            >
              Real projects. Real results.
            </h2>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '1rem', margin: 0 }}>
              Every photo is a real TCOIN Solar installation — no stock imagery.
            </p>
          </Reveal>

          {/* top row: big left + 2 right */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gridTemplateRows: '320px',
              gap: '12px',
            }}
          >
            <div style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <img
                src="/Field photos/panels.jpg"
                alt="Solar panels"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform .6s ease',
                  display: 'block',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '12px' }}>
              <div style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <img
                  src="/Field photos/team.jpg"
                  alt="TCOIN team"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform .6s ease',
                    display: 'block',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                />
              </div>
              <div style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <img
                  src="/Field photos/system.jpg"
                  alt="Solar system"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform .6s ease',
                    display: 'block',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                />
              </div>
            </div>
          </div>

          {/* bottom row: 3 equal */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: '12px',
              marginTop: '12px',
              height: '200px',
            }}
          >
            {[
              '/Field photos/wiring.jpg',
              '/Field photos/showin system side.jpg',
              '/Field photos/work progress.jpg',
            ].map((src, i) => (
              <div key={i} style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <img
                  src={src}
                  alt="TCOIN installation"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform .6s ease',
                    display: 'block',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                />
              </div>
            ))}
          </div>

          <Reveal style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link
              to="/projects"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,.2)',
                padding: '14px 28px',
                fontWeight: 700,
                color: '#fff',
                textDecoration: 'none',
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              View all projects →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ background: '#fff', padding: '7rem 1.5rem' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#1D6434',
                marginBottom: '12px',
              }}
            >
              The Process
            </p>
            <h2
              style={{
                fontSize: 'clamp(2rem,4vw,3rem)',
                fontWeight: 900,
                color: '#14202E',
                margin: '0 0 12px',
              }}
            >
              From survey to switch-on
            </h2>
            <p style={{ color: '#5A6878', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>
              Four simple steps — we handle everything in between.
            </p>
          </Reveal>
          <div
            style={{ display: 'grid', gap: '0', gridTemplateColumns: 'repeat(4,1fr)', position: 'relative' }}
            className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div
              style={{
                position: 'absolute',
                top: '28px',
                left: '12.5%',
                right: '12.5%',
                height: '2px',
                background: 'linear-gradient(90deg, #1D6434, #F5A623)',
                zIndex: 0,
              }}
              className="hidden lg:block"
            />
            {STEPS.map((s, i) => (
              <Reveal
                key={s.n}
                delay={i * 100}
                style={{ padding: '0 1.5rem', textAlign: 'center', position: 'relative', zIndex: 1 }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: i === 0 ? '#1D6434' : '#fff',
                    border: '2px solid #1D6434',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: '0 0 0 6px rgba(29,100,52,.08)',
                    transition: 'all .3s',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 900, color: i === 0 ? '#fff' : '#1D6434' }}>
                    {s.n}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#14202E', margin: '0 0 8px' }}>
                  {s.title}
                </h4>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: '#5A6878', margin: 0 }}>
                  {s.text}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PARTNER LOGOS ══ */}
      <section
        style={{
          background: '#F4F6F9',
          padding: '3rem 1.5rem',
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
              gap: '2rem 3rem',
              alignItems: 'center',
            }}
          >
            {LOGOS.map((name) => (
              <span
                key={name}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#14202E',
                  opacity: 0.45,
                  letterSpacing: '0.04em',
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY US ══ */}
      <section style={{ background: '#F4F6F9', padding: '7rem 1.5rem' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#1D6434',
                marginBottom: '12px',
              }}
            >
              Why Choose Us
            </p>
            <h2
              style={{
                fontSize: 'clamp(2rem,4vw,3rem)',
                fontWeight: 900,
                color: '#14202E',
                margin: '0 0 12px',
              }}
            >
              The TCOIN difference
            </h2>
            <p style={{ color: '#5A6878', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>
              We don't just sell solar — we engineer, install and support it for life.
            </p>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 80}>
                <div
                  style={{
                    borderRadius: '20px',
                    border: '1px solid #D9DEE5',
                    background: '#fff',
                    padding: '1.75rem',
                    height: '100%',
                    boxSizing: 'border-box',
                    transition: 'all .25s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
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
                    {w.icon}
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#14202E', margin: '0 0 8px' }}>
                    {w.title}
                  </h4>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: '#5A6878', margin: 0 }}>
                    {w.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section
        style={{ background: '#1D6434', padding: '7rem 1.5rem', position: 'relative', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '-80px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,.05)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            right: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,.05)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,.5)',
                marginBottom: '12px',
              }}
            >
              Client Stories
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.8rem,3.5vw,2.5rem)',
                fontWeight: 900,
                color: '#fff',
                margin: '0 0 3.5rem',
              }}
            >
              Trusted by hundreds across Uganda
            </h2>
          </Reveal>
          <div style={{ position: 'relative', minHeight: '220px' }}>
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: i === tIdx ? 1 : 0,
                  transform: i === tIdx ? 'none' : 'translateY(16px)',
                  transition: 'all .6s ease',
                  pointerEvents: i === tIdx ? 'auto' : 'none',
                }}
              >
                <p
                  style={{
                    fontSize: '1.25rem',
                    fontStyle: 'italic',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,.88)',
                    margin: '0 0 1.5rem',
                  }}
                >
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, si) => (
                    <span key={si} style={{ color: '#F5A623', fontSize: '1.1rem' }}>
                      ★
                    </span>
                  ))}
                </div>
                <p style={{ fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{t.name}</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,.5)', margin: 0 }}>{t.role}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setTIdx(i)}
                style={{
                  height: '8px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all .3s',
                  width: i === tIdx ? '32px' : '8px',
                  background: i === tIdx ? '#F5A623' : 'rgba(255,255,255,.3)',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section
        style={{ position: 'relative', background: '#0b1a0e', padding: '8rem 1.5rem', overflow: 'hidden' }}
      >
        <img
          src="/Field photos/showin system stright.jpg"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(105deg, #0b1a0e 0%, rgba(11,26,14,.88) 50%, rgba(11,26,14,.6) 100%)',
          }}
        />
        <Reveal style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#F5A623',
              marginBottom: '16px',
            }}
          >
            Get Started Today
          </p>
          <h2
            style={{
              fontSize: 'clamp(2.5rem,6vw,4.5rem)',
              fontWeight: 900,
              lineHeight: 1.0,
              color: '#fff',
              margin: '0 0 1.5rem',
            }}
          >
            Ready to
            <br />
            go solar?
          </h2>
          <p
            style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,.55)',
              maxWidth: '520px',
              margin: '0 auto 3rem',
              lineHeight: 1.7,
            }}
          >
            Join hundreds of Ugandan homes and businesses already saving with TCOIN Solar. Call us on{' '}
            <a href={`tel:${p.mobile}`} style={{ color: '#F5A623', fontWeight: 700, textDecoration: 'none' }}>
              {p.mobile}
            </a>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '16px',
                background: '#F5A623',
                padding: '18px 36px',
                fontWeight: 800,
                fontSize: '1.05rem',
                color: '#fff',
                textDecoration: 'none',
                boxShadow: '0 12px 40px rgba(245,166,35,.25)',
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
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,.2)',
                background: 'rgba(255,255,255,.06)',
                padding: '18px 36px',
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#fff',
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,.06)';
                e.currentTarget.style.transform = 'none';
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
