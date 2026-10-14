import { ServicePage } from '../components/ServicePage';

const CONSULT_SERVICES = [
  {
    name: 'Energy Audit',
    duration: '2 hours',
    desc: 'Full review of your current energy consumption, tariff and waste — with a prioritised action plan.',
  },
  {
    name: 'Feasibility Study',
    duration: '1 day',
    desc: 'Technical and financial analysis of a proposed solar project, including payback period and IRR.',
  },
  {
    name: 'Design Review',
    duration: '90 min',
    desc: 'Independent review of a solar design or quote you have received from another supplier.',
  },
  {
    name: 'Grid Connection',
    duration: '2–3 days',
    desc: 'Guidance and documentation support for connecting your system to the UMEME grid.',
  },
];

const ConsultExtra = (
  <div>
    <p
      style={{
        fontSize: '0.72rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: '#3B3A93',
        marginBottom: '10px',
      }}
    >
      What We Offer
    </p>
    <h2
      style={{
        fontSize: 'clamp(1.8rem,4vw,2.8rem)',
        fontWeight: 900,
        color: '#14202E',
        margin: '0 0 2.5rem',
      }}
    >
      Consultancy services
    </h2>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #E5E9EF',
      }}
    >
      {CONSULT_SERVICES.map((s, i) => (
        <div
          key={s.name}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '1rem',
            alignItems: 'center',
            background: i % 2 === 0 ? '#fff' : '#F9FAFB',
            padding: '1.25rem 1.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 800, color: '#14202E', fontSize: '0.95rem' }}>
              {s.name}
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#5A6878', lineHeight: 1.6 }}>{s.desc}</p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span
              style={{
                display: 'inline-block',
                borderRadius: '999px',
                background: 'rgba(59,58,147,.1)',
                padding: '4px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#3B3A93',
                whiteSpace: 'nowrap',
              }}
            >
              {s.duration}
            </span>
          </div>
        </div>
      ))}
    </div>
    <p style={{ marginTop: '1.5rem', fontSize: '0.82rem', color: '#9AA3AE', textAlign: 'center' }}>
      All sessions can be conducted on-site or remotely.{' '}
      <a href="/contact" style={{ color: '#3B3A93', fontWeight: 700, textDecoration: 'none' }}>
        Book a session →
      </a>
    </p>
  </div>
);

export default function ServiceConsultancy() {
  return (
    <ServicePage
      title="Expert solar advice, backed by real engineering."
      subtitle="Consultancy"
      intro="Whether you need an independent review of a quote, a full energy audit or a feasibility study for a large project — our engineers give you clear, unbiased answers."
      photo="/Field photos/system.jpg"
      icon="💡"
      accent="#3B3A93"
      steps={[
        {
          title: 'Pick a service',
          text: 'Choose from an energy audit, feasibility study, design review or grid-connection support — or describe your need and we will recommend the right engagement.',
        },
        {
          title: 'Book a slot & confirm',
          text: 'Select a date and time that suits you. We confirm within 2 hours and send a brief pre-session questionnaire to make the most of your time.',
        },
        {
          title: 'Consultation session',
          text: 'An experienced engineer works through your specific situation — on-site or via video call — with no sales pressure and no upselling.',
        },
        {
          title: 'Written report & recommendations',
          text: 'Within 24 hours you receive a clear written report with findings, recommendations and, where relevant, an optional quote for any follow-on work.',
        },
      ]}
      gets={[
        {
          icon: '📝',
          title: 'Written Report',
          text: 'Clear, jargon-free findings and recommendations you can act on immediately.',
        },
        {
          icon: '🔬',
          title: 'Independent Analysis',
          text: 'No conflict of interest — we tell you what you need, not what earns us the most.',
        },
        {
          icon: '💡',
          title: 'Actionable Advice',
          text: 'Prioritised next steps with estimated costs and expected savings for each.',
        },
        {
          icon: '📊',
          title: 'Optional Quote',
          text: 'If follow-on work is needed, we provide a transparent quote — no obligation.',
        },
      ]}
      extra={ConsultExtra}
    />
  );
}
