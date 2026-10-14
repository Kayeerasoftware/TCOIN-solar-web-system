import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ─── data ───────────────────────────────────────────────────────── */

const STATS = [
  { value: '500+', label: 'Systems Installed' },
  { value: '10+', label: 'Years Experience' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '15+', label: 'Districts Covered' },
];

const FILTERS = ['All', 'Residential', 'Commercial', 'Industrial', 'Off-grid', 'Hybrid'];

const PROJECTS = [
  {
    id: 1,
    name: 'Nabulagala Residence',
    type: 'Hybrid',
    sector: 'Residential',
    location: 'Nabulagala, Kampala',
    year: 2024,
    size: '5 kWp',
    img: '/Field photos/panels.jpg',
    desc: 'Rooftop hybrid system with lithium battery backup. Eliminated grid dependency for a family of six.',
    tags: ['Hybrid', 'Residential'],
  },
  {
    id: 2,
    name: 'Mukono Secondary School',
    type: 'Off-grid',
    sector: 'Commercial',
    location: 'Mukono',
    year: 2024,
    size: '10 kWp',
    img: '/Field photos/system.jpg',
    desc: 'Full off-grid system powering classrooms, labs and staff quarters. Zero fuel costs.',
    tags: ['Off-grid', 'Commercial'],
  },
  {
    id: 3,
    name: 'Entebbe Lakeside Hotel',
    type: 'On-grid',
    sector: 'Commercial',
    location: 'Entebbe',
    year: 2023,
    size: '20 kWp',
    img: '/Field photos/showin system stright.jpg',
    desc: "Grid-tied system reducing the hotel's electricity bill by 65%. ROI achieved in 3 years.",
    tags: ['Commercial'],
  },
  {
    id: 4,
    name: 'Jinja Steel Factory',
    type: 'On-grid',
    sector: 'Industrial',
    location: 'Jinja',
    year: 2023,
    size: '50 kWp',
    img: '/Field photos/wiring.jpg',
    desc: 'Large-scale industrial installation with custom protection and monitoring systems.',
    tags: ['Industrial'],
  },
  {
    id: 5,
    name: 'Masaka District Clinic',
    type: 'Hybrid',
    sector: 'Commercial',
    location: 'Masaka',
    year: 2023,
    size: '8 kWp',
    img: '/Field photos/showin system side.jpg',
    desc: 'Critical healthcare facility now running 24/7 on solar. Powers refrigeration and theatre lights.',
    tags: ['Hybrid', 'Commercial'],
  },
  {
    id: 6,
    name: 'Gulu Community Centre',
    type: 'Off-grid',
    sector: 'Off-grid',
    location: 'Gulu',
    year: 2022,
    size: '15 kWp',
    img: '/Field photos/work progress.jpg',
    desc: 'Community-owned off-grid microgrid serving 40 households and a small market.',
    tags: ['Off-grid'],
  },
  {
    id: 7,
    name: 'Kampala Office Complex',
    type: 'Hybrid',
    sector: 'Commercial',
    location: 'Nakasero, Kampala',
    year: 2024,
    size: '30 kWp',
    img: '/Field photos/panels - Copy.jpg',
    desc: 'Multi-floor office building with rooftop array and battery room. Seamless grid failover.',
    tags: ['Hybrid', 'Commercial'],
  },
  {
    id: 8,
    name: 'TCOIN Field Team',
    type: 'Residential',
    sector: 'Residential',
    location: 'Various, Uganda',
    year: 2024,
    size: 'Multiple',
    img: '/Field photos/team.jpg',
    desc: 'Our certified installation crew — the people behind every successful TCOIN Solar project.',
    tags: ['Residential'],
  },
];

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  Hybrid: { bg: '#e8f5e9', text: '#1d6434' },
  'Off-grid': { bg: '#e3f2fd', text: '#1565c0' },
  'On-grid': { bg: '#fff3e0', text: '#e65100' },
  Residential: { bg: '#f3e5f5', text: '#6a1b9a' },
};

/* ─── helpers ────────────────────────────────────────────────────── */

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
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const { ref, vis } = useReveal();
  return (
    <div
      ref={ref}
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

/* ─── sub-components ─────────────────────────────────────────────── */

function ProjectCard({ project, index }: { project: (typeof PROJECTS)[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const tc = TYPE_COLOR[project.type] ?? { bg: '#f5f5f5', text: '#555' };

  return (
    <Reveal delay={index * 60}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: hovered ? '0 20px 48px rgba(0,0,0,0.13)' : '0 2px 12px rgba(0,0,0,0.06)',
          transform: hovered ? 'translateY(-6px)' : 'none',
          transition: 'all 250ms',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: '#111' }}>
          <img
            src={project.img}
            alt={project.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 400ms ease',
              display: 'block',
            }}
          />
          {/* gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)',
            }}
          />
          {/* size badge */}
          <span
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(0,0,0,0.55)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 20,
              backdropFilter: 'blur(6px)',
            }}
          >
            {project.size}
          </span>
          {/* year */}
          <span
            style={{
              position: 'absolute',
              bottom: 12,
              left: 14,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {project.year}
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* type pill */}
          <span
            style={{
              display: 'inline-block',
              background: tc.bg,
              color: tc.text,
              fontSize: 10,
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 20,
              letterSpacing: '0.05em',
              alignSelf: 'flex-start',
            }}
          >
            {project.type}
          </span>

          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#14202E', lineHeight: 1.25 }}>
            {project.name}
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: '#5A6878',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>📍</span> {project.location}
          </p>

          <p style={{ margin: 0, fontSize: 13, color: '#5A6878', lineHeight: 1.6, flex: 1 }}>
            {project.desc}
          </p>

          <div
            style={{
              marginTop: 4,
              paddingTop: 12,
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 12, color: '#1d6434', fontWeight: 700 }}>{project.sector}</span>
            <span style={{ fontSize: 12, color: '#aaa' }}>View details →</span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ─── page ───────────────────────────────────────────────────────── */

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [heroSlide, setHeroSlide] = useState(0);

  const heroImgs = [
    { src: '/Field photos/panels.jpg', caption: 'Rooftop array, Kampala' },
    { src: '/Field photos/system.jpg', caption: 'Completed hybrid system' },
    { src: '/Field photos/showin system stright.jpg', caption: 'System installation, Entebbe' },
    { src: '/Field photos/team.jpg', caption: 'Our certified crew' },
  ];

  useEffect(() => {
    const t = setInterval(() => setHeroSlide((s) => (s + 1) % heroImgs.length), 4000);
    return () => clearInterval(t);
  }, []);

  const filtered = activeFilter === 'All' ? PROJECTS : PROJECTS.filter((p) => p.tags.includes(activeFilter));

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh' }}>
      {/* ══ HERO ══ */}
      <section style={{ position: 'relative', height: 520, overflow: 'hidden', background: '#0b1a0e' }}>
        {heroImgs.map((h, i) => (
          <img
            key={i}
            src={h.src}
            alt={h.caption}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: i === heroSlide ? 1 : 0,
              transition: 'opacity 800ms ease',
              display: 'block',
            }}
          />
        ))}
        {/* overlays */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(105deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.2) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
          }}
        />

        {/* content */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: 1152,
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <p
            style={{
              margin: '0 0 12px',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#F5A623',
            }}
          >
            Our Work
          </p>
          <h1
            style={{
              margin: '0 0 16px',
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.05,
            }}
          >
            Real projects.
            <br />
            <span style={{ color: '#F5A623' }}>Real results.</span>
          </h1>
          <p
            style={{
              margin: '0 0 32px',
              fontSize: 16,
              color: 'rgba(255,255,255,0.7)',
              maxWidth: 480,
              lineHeight: 1.7,
            }}
          >
            Over 500 solar installations across Uganda — homes, schools, clinics, factories and communities.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#F5A623',
                color: '#fff',
                padding: '13px 28px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(245,166,35,0.3)',
              }}
            >
              Get a Free Quote →
            </Link>
            <Link
              to="/calculator"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                border: '1.5px solid rgba(255,255,255,0.3)',
                color: '#fff',
                padding: '13px 28px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              Solar Calculator
            </Link>
          </div>
        </div>

        {/* slide dots */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
            zIndex: 3,
          }}
        >
          {heroImgs.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              style={{
                width: i === heroSlide ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                background: i === heroSlide ? '#F5A623' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 300ms',
              }}
            />
          ))}
        </div>

        {/* caption */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 24,
            zIndex: 3,
            fontSize: 11,
            color: 'rgba(255,255,255,0.5)',
            fontStyle: 'italic',
          }}
        >
          {heroImgs[heroSlide].caption}
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <section style={{ background: '#1d6434', padding: '0' }}>
        <div
          style={{
            maxWidth: 1152,
            margin: '0 auto',
            padding: '0 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: '28px 20px',
                textAlign: 'center',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none',
              }}
            >
              <p
                style={{ margin: '0 0 4px', fontSize: 32, fontWeight: 900, color: '#F5A623', lineHeight: 1 }}
              >
                {s.value}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ BENTO PHOTO GRID ══ */}
      <section style={{ background: '#0b1a0e', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <Reveal style={{ marginBottom: 40, textAlign: 'center' }}>
            <p
              style={{
                margin: '0 0 10px',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#F5A623',
              }}
            >
              Field Photos
            </p>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 900, color: '#fff' }}>
              Every photo is a real installation
            </h2>
          </Reveal>

          {/* row 1: 2 + 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
            <BentoImg src="/Field photos/panels.jpg" alt="Solar panels array" height={320} />
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 10 }}>
              <BentoImg src="/Field photos/team.jpg" alt="TCOIN installation team" height={155} />
              <BentoImg src="/Field photos/system.jpg" alt="Completed system" height={155} />
            </div>
          </div>
          {/* row 2: 3 equal */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            <BentoImg src="/Field photos/wiring.jpg" alt="Wiring and protection" height={190} />
            <BentoImg src="/Field photos/showin system side.jpg" alt="System side view" height={190} />
            <BentoImg src="/Field photos/work progress.jpg" alt="Work in progress" height={190} />
          </div>
        </div>
      </section>

      {/* ══ PROJECT GRID ══ */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          {/* header + filters */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 32,
            }}
          >
            <Reveal>
              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#1d6434',
                }}
              >
                Portfolio
              </p>
              <h2
                style={{
                  margin: 0,
                  fontSize: 'clamp(1.8rem,3.5vw,2.6rem)',
                  fontWeight: 900,
                  color: '#14202E',
                  lineHeight: 1.1,
                }}
              >
                Selected projects
              </h2>
            </Reveal>

            {/* filter pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 20,
                    border: `1.5px solid ${activeFilter === f ? '#1d6434' : '#D9DEE5'}`,
                    background: activeFilter === f ? '#1d6434' : '#fff',
                    color: activeFilter === f ? '#fff' : '#5A6878',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* count */}
          <p style={{ margin: '0 0 24px', fontSize: 13, color: '#5A6878' }}>
            Showing <strong style={{ color: '#14202E' }}>{filtered.length}</strong> project
            {filtered.length !== 1 ? 's' : ''}
            {activeFilter !== 'All' ? ` · ${activeFilter}` : ''}
          </p>

          {/* grid */}
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}
          >
            {filtered.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROCESS STRIP ══ */}
      <section style={{ background: '#fff', padding: '72px 24px', borderTop: '1px solid #e8ecf0' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 48 }}>
            <p
              style={{
                margin: '0 0 10px',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#1d6434',
              }}
            >
              How We Work
            </p>
            <h2
              style={{ margin: 0, fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 900, color: '#14202E' }}
            >
              From survey to switch-on
            </h2>
          </Reveal>
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, position: 'relative' }}
          >
            {/* connector line */}
            <div
              style={{
                position: 'absolute',
                top: 27,
                left: '12.5%',
                right: '12.5%',
                height: 2,
                background: 'linear-gradient(90deg,#1d6434,#F5A623)',
                zIndex: 0,
              }}
            />
            {[
              {
                n: '01',
                title: 'Free Site Survey',
                text: 'We visit, assess your energy needs and take measurements — at no cost.',
              },
              {
                n: '02',
                title: 'Custom Design',
                text: 'Sized system design with a transparent, itemised quote.',
              },
              {
                n: '03',
                title: 'Installation',
                text: 'Certified crews install and commission your system, usually in one day.',
              },
              {
                n: '04',
                title: 'Ongoing Support',
                text: 'Remote monitoring, annual service visits and a direct line to our engineers.',
              },
            ].map((s, i) => (
              <Reveal
                key={s.n}
                delay={i * 100}
                style={{ padding: '0 20px', textAlign: 'center', position: 'relative', zIndex: 1 }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    background: i === 0 ? '#1d6434' : '#fff',
                    border: '2px solid #1d6434',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 0 0 6px rgba(29,100,52,0.08)',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 900, color: i === 0 ? '#fff' : '#1d6434' }}>
                    {s.n}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, color: '#14202E' }}>
                  {s.title}
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: '#5A6878', lineHeight: 1.65 }}>{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section
        style={{ position: 'relative', background: '#0b1a0e', padding: '80px 24px', overflow: 'hidden' }}
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
            opacity: 0.18,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(105deg,#0b1a0e 0%,rgba(11,26,14,0.85) 60%,rgba(11,26,14,0.5) 100%)',
          }}
        />
        <Reveal
          style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', textAlign: 'center' }}
        >
          <p
            style={{
              margin: '0 0 14px',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#F5A623',
            }}
          >
            Start Your Project
          </p>
          <h2
            style={{
              margin: '0 0 16px',
              fontSize: 'clamp(2rem,5vw,3.5rem)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.05,
            }}
          >
            Ready to join our
            <br />
            growing list of clients?
          </h2>
          <p style={{ margin: '0 0 36px', fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
            Get a free site survey and custom quote — no obligation.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#F5A623',
                color: '#fff',
                padding: '15px 32px',
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 15,
                textDecoration: 'none',
                boxShadow: '0 10px 32px rgba(245,166,35,0.25)',
              }}
            >
              Request a Free Quote →
            </Link>
            <Link
              to="/calculator"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                border: '1.5px solid rgba(255,255,255,0.25)',
                color: '#fff',
                padding: '15px 32px',
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.07)',
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

/* ─── BentoImg ───────────────────────────────────────────────────── */
function BentoImg({ src, alt, height }: { src: string; alt: string; height: number }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ borderRadius: 14, overflow: 'hidden', height, background: '#111' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transform: hov ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 400ms ease',
        }}
      />
    </div>
  );
}
