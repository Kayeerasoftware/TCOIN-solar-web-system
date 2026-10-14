import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import '../portal.css';

export default function Privacy() {
  const p = useCompanyProfile();
  return (
    <div className="pt-doc">
      <div
        className="pt-page-head"
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: 0,
          minHeight: 72,
        }}
      >
        <img
          src="/brand/TCOIN LOGO OFFICIAL.svg"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            right: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            height: '160%',
            width: 'auto',
            opacity: 0.07,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
        <div
          style={{
            width: 72,
            height: 72,
            flexShrink: 0,
            background: '#f1f4f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ba19d',
            fontSize: 28,
          }}
        >
          🔒
        </div>
        <div style={{ padding: '14px 22px 12px 0' }}>
          <h1>Privacy &amp; Data</h1>
          <p>How we collect, store, and protect your personal information.</p>
        </div>
      </div>

      <div className="pt-section">
        <div className="pt-section-head">
          <h2>Data we hold</h2>
        </div>
        <div className="pt-section-body" style={{ padding: '14px 22px' }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: '#3c4540' }}>
            We collect only the information necessary to provide our services. Your data is stored securely
            and never sold to third parties.
          </p>
          {[
            'Contact details (name, email, phone)',
            'Site and installation information',
            'Billing and payment records (required by law for 7 years)',
            'Support ticket history',
          ].map((item) => (
            <div key={item} className="pt-row" style={{ gridTemplateColumns: '20px 1fr' }}>
              <span style={{ color: '#14723a', fontWeight: 800 }}>·</span>
              <span style={{ fontSize: 13, color: '#3c4540' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-section">
        <div className="pt-section-head">
          <h2>Your rights</h2>
        </div>
        <div className="pt-section-body" style={{ padding: '14px 22px' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#3c4540' }}>
            You may request a copy of your data or ask us to delete your personal information (subject to
            legal hold requirements) by contacting us at{' '}
            <a href={`mailto:${p.email}`} style={{ color: '#14723a', fontWeight: 700 }}>
              {p.email}
            </a>
            .
          </p>
        </div>
      </div>

      <div className="pt-doc-footer">
        <span>TCOIN Solar UG · Customer Portal</span>
        <span>Your privacy is important to us.</span>
      </div>
    </div>
  );
}
