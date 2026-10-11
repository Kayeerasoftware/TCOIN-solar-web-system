import { useCompanyProfile } from '@/hooks/useCompanyProfile';

export default function About() {
  const p = useCompanyProfile();
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-green">{p.legal_name}</h1>
      <p className="mt-2 text-brand-indigo font-medium">{p.tagline}</p>
      <p className="mt-6 text-ink-muted">
        TCOIN SOLAR UG is the solar energy division of TCOIN Center of Innovations, based in Nabulagala,
        Kampala. We design, supply, install, and maintain solar energy systems for homes, businesses, and
        institutions across Uganda.
      </p>
      <h2 className="mt-10 text-xl font-bold">What we do</h2>
      <ul className="mt-4 space-y-2">
        {p.what_we_do.map((item) => (
          <li key={item} className="flex gap-2 text-sm">
            <span className="text-brand-green">✓</span>
            {item}
          </li>
        ))}
      </ul>
      <h2 className="mt-10 text-xl font-bold">Contact</h2>
      <div className="mt-4 space-y-1 text-sm text-ink-muted">
        <p>📍 {p.address}</p>
        <p>📬 {p.po_box}</p>
        <p>
          📞 {p.tel} / {p.mobile}
        </p>
        {p.hotlines.map((h) => (
          <p key={h}>📞 {h}</p>
        ))}
        <p>
          ✉️{' '}
          <a href={`mailto:${p.email}`} className="text-brand-green underline">
            {p.email}
          </a>
        </p>
        <p>
          🌐{' '}
          <a
            href={`https://${p.web}`}
            target="_blank"
            rel="noreferrer"
            className="text-brand-green underline"
          >
            {p.web}
          </a>
        </p>
      </div>
    </div>
  );
}
