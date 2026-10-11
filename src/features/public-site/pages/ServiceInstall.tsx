import { Link } from 'react-router-dom';

export default function ServiceInstall() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-green">Solar Installation</h1>
      <p className="mt-4 text-ink-muted">
        Our certified technicians handle every aspect of installation — from mounting and wiring to
        commissioning and handover.
      </p>
      <ul className="mt-8 space-y-3">
        {[
          'Panel mounting and racking',
          'Inverter and battery installation',
          'Electrical wiring and protection',
          'System commissioning and testing',
          'Customer training and handover pack',
        ].map((s) => (
          <li key={s} className="flex gap-2">
            <span className="text-brand-green">✓</span>
            {s}
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <Link
          to="/contact"
          className="rounded-md bg-brand-accent px-6 py-3 font-bold text-ink hover:brightness-95"
        >
          Book a survey
        </Link>
      </div>
    </div>
  );
}
