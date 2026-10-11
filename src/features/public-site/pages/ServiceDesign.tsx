import { Link } from 'react-router-dom';

export default function ServiceDesign() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-green">Solar System Design</h1>
      <p className="mt-4 text-ink-muted">
        We engineer bespoke solar systems for homes, businesses, and institutions across Uganda. Every design
        starts with a site survey and energy audit.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {['Site survey & energy audit', 'System sizing & BOM', 'Engineering drawings & approval'].map((s) => (
          <div key={s} className="rounded-lg border border-line bg-white p-5">
            <div className="text-2xl text-brand-green">✓</div>
            <p className="mt-2 font-medium">{s}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex gap-4">
        <Link
          to="/calculator"
          className="rounded-md bg-brand-accent px-6 py-3 font-bold text-ink hover:brightness-95"
        >
          Estimate my system
        </Link>
        <Link
          to="/contact"
          className="rounded-md border border-brand-green px-6 py-3 font-bold text-brand-green hover:bg-green-50"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
