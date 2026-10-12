import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormField } from '@/components/forms/FormField';
import { TextInput } from '@/components/forms/controls';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Card } from '@/components/ui/Card';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const services = [
  {
    to: '/services/design',
    title: 'Design',
    text: 'Site survey, sizing, single-line diagrams and a priced bill of materials.',
  },
  {
    to: '/services/installation',
    title: 'Installation',
    text: 'Certified crews, safety checklists and commissioning records.',
  },
  {
    to: '/services/maintenance',
    title: 'Maintenance',
    text: 'Service plans, warranty tracking and fast fault response.',
  },
  {
    to: '/services/consultancy',
    title: 'Consultancy',
    text: 'Energy audits, feasibility studies and design reviews.',
  },
];

export default function Home() {
  useDocumentTitle('Home');
  const navigate = useNavigate();
  const p = useCompanyProfile();
  const [bill, setBill] = useState('450000');
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4">
      <section className="grid items-center gap-6 py-6 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight text-brand-green">
            Reliable solar for your home or business
          </h1>
          <p className="mt-3 text-lg text-ink-muted">
            {p.tagline}. Solar design, installation, maintenance, consultancy and components from one team.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink to="/calculator">Get my free estimate</ButtonLink>
            <ButtonLink to="/store" variant="secondary">
              Shop components
            </ButtonLink>
          </div>
        </div>
        <Card title="How much could you save?">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/calculator?bill=${bill}`);
            }}
            aria-label="Quick estimate"
          >
            <FormField label="Monthly electricity bill (UGX)" htmlFor="quick-bill">
              <TextInput
                id="quick-bill"
                inputMode="numeric"
                value={bill}
                onChange={(e) => setBill(e.target.value.replace(/[^\d]/g, ''))}
              />
            </FormField>
            <Button type="submit" className="w-full">
              Calculate
            </Button>
          </form>
        </Card>
      </section>
      <section aria-labelledby="services-h">
        <h2 id="services-h" className="mb-3 text-2xl font-bold">
          Our services
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <Card key={s.to}>
              <h3 className="mb-1 font-bold">
                <Link to={s.to} className="text-brand-green hover:underline">
                  {s.title}
                </Link>
              </h3>
              <p className="text-sm text-ink-muted">{s.text}</p>
            </Card>
          ))}
        </div>
      </section>
      <section aria-labelledby="what-h">
        <h2 id="what-h" className="mb-3 text-2xl font-bold">
          What TCOIN does
        </h2>
        <Card>
          <ul className="list-disc space-y-1 pl-5">
            {p.what_we_do.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </Card>
      </section>
      <section className="rounded-lg border border-line bg-amber-50 p-6">
        <h2 className="text-xl font-bold">Ready to start?</h2>
        <p className="text-ink-muted">Talk to an engineer on {p.mobile}.</p>
        <div className="mt-3">
          <ButtonLink to="/contact">Request a quote</ButtonLink>
        </div>
      </section>
    </div>
  );
}
