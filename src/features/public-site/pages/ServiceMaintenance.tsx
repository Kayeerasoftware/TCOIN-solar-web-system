import { ServicePage } from '../components/ServicePage';

const PLANS = [
  {
    name: 'Basic',
    visits: 1,
    response: '48 hours',
    color: '#5A6878',
    features: ['Annual inspection', 'Fault diagnosis', 'Written report'],
  },
  {
    name: 'Standard',
    visits: 2,
    response: '24 hours',
    color: '#1D6434',
    features: ['Bi-annual inspections', 'Panel cleaning', 'Warranty tracking', 'Priority response'],
  },
  {
    name: 'Premium',
    visits: 4,
    response: '4 hours',
    color: '#F5A623',
    features: [
      'Quarterly inspections',
      'Panel cleaning',
      'Warranty tracking',
      'Same-day response',
      'Remote monitoring',
      'Free minor repairs',
    ],
  },
];

const PlansExtra = (
  <div>
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
      Service Plans
    </p>
    <h2
      style={{
        fontSize: 'clamp(1.8rem,4vw,2.8rem)',
        fontWeight: 900,
        color: '#14202E',
        margin: '0 0 2.5rem',
      }}
    >
      Choose your plan
    </h2>
    <div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}
    >
      {PLANS.map((plan) => (
        <div
          key={plan.name}
          style={{
            borderRadius: '20px',
            border: `2px solid ${plan.color}33`,
            background: '#fff',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,.06)',
            transition: 'all .25s',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = `0 16px 40px ${plan.color}22`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.06)';
          }}
        >
          <div
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: plan.color }}
          />
          <h3 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 900, color: '#14202E' }}>
            {plan.name}
          </h3>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: '#5A6878' }}>
            <span style={{ fontWeight: 700, color: plan.color }}>
              {plan.visits} visit{plan.visits > 1 ? 's' : ''}/year
            </span>{' '}
            · Response: <span style={{ fontWeight: 700 }}>{plan.response}</span>
          </p>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {plan.features.map((f) => (
              <li key={f} style={{ display: 'flex', gap: '8px', fontSize: '0.875rem', color: '#5A6878' }}>
                <span style={{ color: plan.color, fontWeight: 900, flexShrink: 0 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <p style={{ marginTop: '1.5rem', fontSize: '0.82rem', color: '#9AA3AE', textAlign: 'center' }}>
      Prices are provided in your personalised quote.{' '}
      <a href="/contact" style={{ color: '#1D6434', fontWeight: 700, textDecoration: 'none' }}>
        Contact us →
      </a>
    </p>
  </div>
);

export default function ServiceMaintenance() {
  return (
    <ServicePage
      title="Keep your system at peak output, year after year."
      subtitle="Maintenance"
      intro="Solar systems need regular care to maintain output and catch faults early. Our maintenance plans give you scheduled visits, warranty tracking and a guaranteed fast response when something goes wrong."
      photo="/Field photos/showin system side.jpg"
      icon="🔧"
      accent="#1D6434"
      steps={[
        {
          title: 'Choose a plan',
          text: 'Select Basic, Standard or Premium based on your system size and how quickly you need a response to faults.',
        },
        {
          title: 'Schedule your first visit',
          text: 'We book your first inspection within 2 weeks of signing up and set a recurring calendar for all future visits.',
        },
        {
          title: 'On-site inspection',
          text: 'A certified technician inspects panels, connections, inverter logs, battery health and protection devices against our 40-point checklist.',
        },
        {
          title: 'Panel cleaning & minor repairs',
          text: 'Panels are cleaned, connections re-torqued and any minor faults fixed on the spot. Major faults are quoted separately.',
        },
        {
          title: 'Inspection report',
          text: 'You receive a written report with photos, findings, actions taken and any recommendations — stored in your customer portal.',
        },
      ]}
      gets={[
        {
          icon: '🔍',
          title: 'Preventive Inspections',
          text: 'Catch faults before they cost you — panels, inverter, batteries and wiring all checked.',
        },
        {
          icon: '🧹',
          title: 'Panel Cleaning',
          text: 'Dirty panels lose up to 25% output. We clean them on every scheduled visit.',
        },
        {
          icon: '📋',
          title: 'Warranty Tracking',
          text: 'We log every component warranty and alert you before any expire.',
        },
        {
          icon: '⚡',
          title: 'Priority Response',
          text: 'Guaranteed response times — as fast as 4 hours on the Premium plan.',
        },
      ]}
      extra={PlansExtra}
    />
  );
}
