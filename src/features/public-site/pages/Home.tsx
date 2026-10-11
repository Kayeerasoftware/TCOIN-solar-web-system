import { Link } from 'react-router-dom';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

const services = [
  {
    to: '/services/design',
    icon: '☀️',
    title: 'Solar Design',
    desc: 'Custom system sizing and engineering for homes and businesses.',
  },
  {
    to: '/services/installation',
    icon: '🔧',
    title: 'Installation',
    desc: 'Professional installation by certified technicians.',
  },
  {
    to: '/services/maintenance',
    icon: '🛡️',
    title: 'Maintenance Plans',
    desc: 'Keep your system performing at peak efficiency.',
  },
  {
    to: '/services/consultancy',
    icon: '💡',
    title: 'Consultancy',
    desc: 'Expert advice on energy independence and cost savings.',
  },
];

const stats = [
  { label: 'Systems installed', value: '500+' },
  { label: 'Happy customers', value: '480+' },
  { label: 'Years experience', value: '10+' },
  { label: 'Districts served', value: '20+' },
];

export default function Home() {
  const p = useCompanyProfile();
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-green px-4 py-20 text-center text-white">
        <h1 className="text-4xl font-bold leading-tight">{p.division}</h1>
        <p className="mt-3 text-lg text-green-100">{p.tagline}</p>
        <p className="mx-auto mt-4 max-w-xl text-green-200">
          Uganda's trusted solar energy partner — design, supply, install, and maintain.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/calculator"
            className="rounded-md bg-brand-accent px-6 py-3 font-bold text-ink hover:brightness-95"
          >
            Estimate my savings
          </Link>
          <Link
            to="/store"
            className="rounded-md border border-white px-6 py-3 font-bold text-white hover:bg-white/10"
          >
            Shop components
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white px-4 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-brand-green">{s.value}</div>
              <div className="mt-1 text-sm text-ink-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-bold">What we do</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="rounded-lg border border-line bg-white p-5 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-4xl">{s.icon}</div>
                <h3 className="mt-3 font-bold text-brand-green">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-indigo px-4 py-14 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to go solar?</h2>
        <p className="mt-2 text-indigo-200">Use our free calculator to see how much you could save.</p>
        <Link
          to="/calculator"
          className="mt-6 inline-block rounded-md bg-brand-accent px-8 py-3 font-bold text-ink hover:brightness-95"
        >
          Start the calculator →
        </Link>
      </section>

      {/* What we do list */}
      <section className="bg-white px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-xl font-bold">Our capabilities</h2>
          <ul className="space-y-2">
            {p.what_we_do.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-ink">
                <span className="mt-0.5 text-brand-green">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
