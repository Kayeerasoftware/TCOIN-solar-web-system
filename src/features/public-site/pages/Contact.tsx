import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { submitLead } from '@/api/endpoints/crm';
import { SuccessBanner } from '@/components/feedback/SuccessBanner';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { applyServerErrors } from '@/lib/forms';
import { requiredText } from '@/lib/validators';

const schema = z
  .object({
    full_name: requiredText('Name'),
    phone: z.string().trim().optional(),
    email: z.string().trim().email('Enter a valid email address').or(z.literal('')).optional(),
    location: z.string().trim().optional(),
    service_interest: z.string().optional(),
    message: z.string().trim().optional(),
  })
  .refine((v) => !!v.phone || !!v.email, {
    path: ['phone'],
    message: 'Give a phone number or an email address',
  });
type Form = z.infer<typeof schema>;

const CSS = `
  .ct-hero-pills { display:flex; flex-wrap:wrap; justify-content:center; gap:12px; margin-top:2rem; }
  .ct-pill { display:inline-flex; align-items:center; gap:10px; border-radius:999px;
    border:1px solid rgba(255,255,255,.2); background:rgba(255,255,255,.08);
    padding:10px 20px; font-size:.85rem; font-weight:600; color:#fff;
    backdrop-filter:blur(8px); text-decoration:none; transition:background .2s; }
  .ct-pill:hover { background:rgba(255,255,255,.18); }
  .ct-pill-icon { width:30px; height:30px; border-radius:50%; background:rgba(245,166,35,.2);
    display:flex; align-items:center; justify-content:center; font-size:.95rem; flex-shrink:0; }
  .ct-body { max-width:1152px; margin:0 auto; padding:5rem 1.5rem;
    display:grid; grid-template-columns:1fr; gap:2.5rem; }
  .ct-ways { display:grid; grid-template-columns:1fr; gap:1.5rem; }
  .ct-input { width:100%; border-radius:10px; border:1.5px solid #D9DEE5;
    background:#F9FAFB; padding:11px 14px; font-size:.95rem; color:#14202E;
    outline:none; transition:border-color .2s, box-shadow .2s; box-sizing:border-box; font-family:inherit; }
  .ct-input:focus { border-color:#1D6434; box-shadow:0 0 0 3px rgba(29,100,52,.1); background:#fff; }
  .ct-input.invalid { border-color:#e53935; }
  .ct-label { display:block; font-size:.8rem; font-weight:700; color:#14202E;
    margin-bottom:5px; letter-spacing:.02em; }
  .ct-err { font-size:.78rem; color:#e53935; margin-top:4px; }
  .ct-field { margin-bottom:1.1rem; }
  .ct-row2 { display:grid; grid-template-columns:1fr; gap:0; }
  @media(min-width:640px){
    .ct-ways { grid-template-columns:repeat(3,1fr); }
    .ct-row2 { grid-template-columns:1fr 1fr; gap:0 1rem; }
  }
  @media(min-width:1024px){
    .ct-body { grid-template-columns:1fr 420px; }
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
}: {
  children: React.ReactNode;
  delay?: number;
  style?: CSSProperties;
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

const HOURS = [
  { day: 'Monday – Friday', time: '8:00 am – 6:00 pm' },
  { day: 'Saturday', time: '9:00 am – 4:00 pm' },
  { day: 'Sunday', time: 'Emergency calls only' },
];

export default function Contact() {
  useDocumentTitle('Contact & Quote Request');
  const p = useCompanyProfile();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { service_interest: 'design' },
  });

  const send = useMutation({
    mutationFn: (v: Form) =>
      submitLead({ ...v, phone: v.phone || undefined, email: v.email || undefined, source_code: 'web_form' }),
    onSuccess: () => reset(),
    onError: (e) => applyServerErrors(e, setError),
  });

  return (
    <div style={{ overflowX: 'hidden', background: '#fff' }}>
      <style>{CSS}</style>

      {/* ══ HERO ══ */}
      <section
        style={{ position: 'relative', padding: '9rem 1.5rem 6rem', overflow: 'hidden', textAlign: 'center' }}
      >
        <img
          src="/Field photos/work progress.jpg"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 60%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(160deg, rgba(0,0,0,.88) 0%, rgba(0,0,0,.7) 50%, rgba(0,0,0,.5) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 55%)',
          }}
        />

        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '999px',
              border: '1px solid rgba(245,166,35,.4)',
              background: 'rgba(0,0,0,.3)',
              padding: '6px 18px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#F5A623',
              backdropFilter: 'blur(8px)',
              marginBottom: '1.5rem',
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
            We respond within 2 hours
          </div>
          <h1
            style={{
              fontSize: 'clamp(2.5rem,6vw,4.5rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              color: '#fff',
              margin: '0 0 1rem',
              letterSpacing: '-0.02em',
            }}
          >
            Let's talk solar.
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem,1.8vw,1.2rem)',
              color: 'rgba(255,255,255,.7)',
              lineHeight: 1.7,
              maxWidth: '560px',
              margin: '0 auto',
            }}
          >
            Request a free quote, ask a technical question, or just say hello — our engineers are ready.
          </p>

          <div className="ct-hero-pills">
            <a href={`tel:${p.mobile}`} className="ct-pill">
              <span className="ct-pill-icon">📞</span>
              {p.mobile}
            </a>
            <a href={`mailto:${p.email}`} className="ct-pill">
              <span className="ct-pill-icon">✉️</span>
              {p.email}
            </a>
            <span className="ct-pill">
              <span className="ct-pill-icon">📍</span>
              {p.address}
            </span>
          </div>
        </div>
      </section>

      {/* ══ BODY: FORM + INFO ══ */}
      <div className="ct-body">
        {/* ── FORM ── */}
        <Reveal>
          <div
            style={{
              borderRadius: '24px',
              border: '1px solid #E5E9EF',
              background: '#fff',
              boxShadow: '0 8px 40px rgba(0,0,0,.07)',
              overflow: 'hidden',
            }}
          >
            {/* form header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1D6434 0%, #155228 100%)',
                padding: '2rem 2.5rem',
              }}
            >
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,.55)',
                }}
              >
                Free, no-obligation
              </p>
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
                Request a Quote
              </h2>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,.65)',
                  lineHeight: 1.6,
                }}
              >
                Fill in the form and one of our engineers will call you back within 2 hours.
              </p>
            </div>

            <div style={{ padding: '2rem 2.5rem' }}>
              {send.isSuccess && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <SuccessBanner
                    title="Request received"
                    message={`Your reference is ${send.data.lead_no}. We will contact you soon.`}
                  />
                </div>
              )}

              <form onSubmit={handleSubmit((v) => send.mutate(v))} noValidate aria-label="Request a quote">
                {errors.root && (
                  <p role="alert" style={{ color: '#e53935', marginBottom: '1rem', fontSize: '.9rem' }}>
                    {errors.root.message}
                  </p>
                )}

                <div className="ct-field">
                  <label className="ct-label" htmlFor="full_name">
                    Full name *
                  </label>
                  <input
                    id="full_name"
                    className={`ct-input${errors.full_name ? ' invalid' : ''}`}
                    {...register('full_name')}
                    placeholder="Your full name"
                  />
                  {errors.full_name && <p className="ct-err">{errors.full_name.message}</p>}
                </div>

                <div className="ct-row2">
                  <div className="ct-field">
                    <label className="ct-label" htmlFor="phone">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className={`ct-input${errors.phone ? ' invalid' : ''}`}
                      {...register('phone')}
                      placeholder="+256 7XX XXX XXX"
                    />
                    {errors.phone && <p className="ct-err">{errors.phone.message}</p>}
                  </div>
                  <div className="ct-field">
                    <label className="ct-label" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`ct-input${errors.email ? ' invalid' : ''}`}
                      {...register('email')}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="ct-err">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="ct-row2">
                  <div className="ct-field">
                    <label className="ct-label" htmlFor="location">
                      Location / District
                    </label>
                    <input
                      id="location"
                      className="ct-input"
                      {...register('location')}
                      placeholder="e.g. Kampala, Wakiso"
                    />
                  </div>
                  <div className="ct-field">
                    <label className="ct-label" htmlFor="service_interest">
                      Service needed
                    </label>
                    <select
                      id="service_interest"
                      className="ct-input"
                      {...register('service_interest')}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="design">System Design</option>
                      <option value="installation">Installation</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="consultancy">Consultancy</option>
                      <option value="components">Components / Supply</option>
                    </select>
                  </div>
                </div>

                <div className="ct-field">
                  <label className="ct-label" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    className="ct-input"
                    rows={4}
                    {...register('message')}
                    placeholder="Tell us about your project, property size, current electricity bill…"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={send.isPending}
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    background: send.isPending ? '#5a9a72' : '#1D6434',
                    border: 'none',
                    padding: '14px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: '#fff',
                    cursor: send.isPending ? 'not-allowed' : 'pointer',
                    boxShadow: '0 6px 20px rgba(29,100,52,.3)',
                    transition: 'all .2s',
                    letterSpacing: '.02em',
                  }}
                  onMouseEnter={(e) => {
                    if (!send.isPending) e.currentTarget.style.background = '#155228';
                  }}
                  onMouseLeave={(e) => {
                    if (!send.isPending) e.currentTarget.style.background = '#1D6434';
                  }}
                >
                  {send.isPending ? 'Sending…' : 'Send Request →'}
                </button>

                <p style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.75rem', color: '#9AA3AE' }}>
                  🔒 Your details are kept private and never shared.
                </p>
              </form>
            </div>
          </div>
        </Reveal>

        {/* ── INFO PANEL ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* contact details */}
          <Reveal delay={80}>
            <div
              style={{
                borderRadius: '20px',
                border: '1px solid #E5E9EF',
                background: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,.05)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: '#F4F6F9',
                  padding: '1.25rem 1.75rem',
                  borderBottom: '1px solid #E5E9EF',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#14202E' }}>
                  Contact Details
                </h3>
              </div>
              <div
                style={{
                  padding: '1.5rem 1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                {[
                  { icon: '📞', label: 'Main line', value: p.tel },
                  { icon: '📱', label: 'Mobile', value: p.mobile },
                  { icon: '🔥', label: 'Hotlines', value: (p.hotlines ?? []).join(' · ') },
                  { icon: '✉️', label: 'Email', value: p.email },
                  { icon: '🌐', label: 'Web', value: p.web },
                  { icon: '📍', label: 'Address', value: `${p.address}, ${p.po_box}` },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(29,100,52,.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p
                        style={{
                          margin: '0 0 2px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          color: '#9AA3AE',
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.9rem',
                          color: '#14202E',
                          fontWeight: 500,
                          lineHeight: 1.5,
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* opening hours */}
          <Reveal delay={140}>
            <div
              style={{
                borderRadius: '20px',
                border: '1px solid #E5E9EF',
                background: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,.05)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: '#F4F6F9',
                  padding: '1.25rem 1.75rem',
                  borderBottom: '1px solid #E5E9EF',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#14202E' }}>
                  Opening Hours
                </h3>
              </div>
              <div
                style={{
                  padding: '1.25rem 1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {HOURS.map((h, i) => (
                  <div
                    key={h.day}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: i < HOURS.length - 1 ? '0.75rem' : 0,
                      borderBottom: i < HOURS.length - 1 ? '1px solid #F0F2F5' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '0.875rem', color: '#5A6878', fontWeight: 500 }}>{h.day}</span>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: i === 2 ? '#F5A623' : '#1D6434',
                      }}
                    >
                      {h.time}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(29,100,52,.06)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#1D6434',
                      flexShrink: 0,
                      boxShadow: '0 0 0 3px rgba(29,100,52,.2)',
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#1D6434', fontWeight: 600 }}>
                    We're open now — call us!
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* map placeholder */}
          <Reveal delay={200}>
            <div
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid #E5E9EF',
                background: '#F4F6F9',
                position: 'relative',
                height: '200px',
              }}
            >
              <img
                src="/Field photos/panels - Copy.jpg"
                alt="Nabulagala, Kampala"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.5 }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '2rem' }}>📍</div>
                <p style={{ margin: 0, fontWeight: 800, color: '#14202E', fontSize: '0.95rem' }}>
                  Nabulagala, Kampala
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#5A6878' }}>Near Kasubi Royal Tombs</p>
                <a
                  href="https://maps.google.com/?q=Nabulagala+Kampala"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '8px',
                    background: '#1D6434',
                    padding: '8px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#fff',
                    textDecoration: 'none',
                  }}
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ══ WAYS TO REACH US ══ */}
      <section style={{ background: '#F4F6F9', padding: '5rem 1.5rem', borderTop: '1px solid #E5E9EF' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#1D6434',
                marginBottom: '10px',
              }}
            >
              Other Ways to Reach Us
            </p>
            <h2
              style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 900, color: '#14202E', margin: 0 }}
            >
              We're always available
            </h2>
          </Reveal>
          <div className="ct-ways">
            {[
              {
                icon: '📞',
                title: 'Call Us',
                desc: 'Speak directly to an engineer. Available Mon–Sat.',
                action: `tel:${p.mobile}`,
                label: p.mobile,
                color: '#1D6434',
              },
              {
                icon: '💬',
                title: 'WhatsApp',
                desc: 'Send us a message or photo of your site anytime.',
                action: `https://wa.me/${p.mobile.replace(/\s+/g, '')}`,
                label: 'Chat on WhatsApp',
                color: '#25D366',
              },
              {
                icon: '✉️',
                title: 'Email Us',
                desc: 'For detailed enquiries, quotes and documents.',
                action: `mailto:${p.email}`,
                label: p.email,
                color: '#3B3A93',
              },
            ].map((w, i) => (
              <Reveal key={w.title} delay={i * 80}>
                <a
                  href={w.action}
                  target={w.action.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    borderRadius: '20px',
                    border: '1px solid #E5E9EF',
                    background: '#fff',
                    padding: '2rem',
                    textDecoration: 'none',
                    transition: 'all .25s',
                    boxShadow: '0 2px 12px rgba(0,0,0,.04)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.04)';
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      background: `${w.color}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                    }}
                  >
                    {w.icon}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800, color: '#14202E' }}>
                      {w.title}
                    </h4>
                    <p
                      style={{ margin: '0 0 10px', fontSize: '0.875rem', color: '#5A6878', lineHeight: 1.6 }}
                    >
                      {w.desc}
                    </p>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: w.color }}>{w.label} →</span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
