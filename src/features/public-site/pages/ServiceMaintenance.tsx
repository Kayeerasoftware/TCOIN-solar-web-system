import { Link } from 'react-router-dom';

const plans = [
  { name: 'Basic', freq: 'Annual', items: ['Annual inspection', 'Cleaning', 'Performance report'] },
  {
    name: 'Standard',
    freq: 'Bi-annual',
    items: ['Bi-annual visits', 'Cleaning & testing', 'Priority support', 'Performance report'],
  },
  {
    name: 'Premium',
    freq: 'Quarterly',
    items: [
      'Quarterly visits',
      'Cleaning & testing',
      '24/7 hotline',
      'Warranty management',
      'Performance report',
    ],
  },
];

export default function ServiceMaintenance() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-green">Maintenance Plans</h1>
      <p className="mt-4 text-ink-muted">
        Protect your investment with a scheduled maintenance contract. Our technicians keep your system
        running at peak efficiency.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name} className="rounded-lg border border-line bg-white p-6">
            <h2 className="text-xl font-bold text-brand-green">{p.name}</h2>
            <p className="mt-1 text-sm text-ink-muted">{p.freq} visits</p>
            <ul className="mt-4 space-y-2">
              {p.items.map((i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-brand-green">✓</span>
                  {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <Link
          to="/contact"
          className="rounded-md bg-brand-accent px-6 py-3 font-bold text-ink hover:brightness-95"
        >
          Get a quote
        </Link>
      </div>
    </div>
  );
}
