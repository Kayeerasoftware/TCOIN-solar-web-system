import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';

export default function ServiceConsultancy() {
  const { data } = useQuery({
    queryKey: ['consultation-services'],
    queryFn: () =>
      api.get('/consultation-services').then(
        (r) =>
          r.data as {
            id: string;
            name: string;
            description: string;
            duration_min: number;
            price: { amount: string; currency: string };
          }[],
      ),
    staleTime: 60_000,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-green">Consultancy Services</h1>
      <p className="mt-4 text-ink-muted">
        Book a one-on-one session with one of our solar engineers. We help you plan, optimise, and
        troubleshoot your energy setup.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {(data ?? []).map((s) => (
          <div key={s.id} className="rounded-lg border border-line bg-white p-5">
            <h2 className="font-bold text-brand-green">{s.name}</h2>
            <p className="mt-1 text-sm text-ink-muted">{s.description}</p>
            <p className="mt-2 text-sm">
              {s.duration_min} min · {s.price.currency} {s.price.amount}
            </p>
          </div>
        ))}
        {!data && <p className="text-sm text-ink-muted">Loading services…</p>}
      </div>
      <div className="mt-10">
        <Link
          to="/login"
          className="rounded-md bg-brand-accent px-6 py-3 font-bold text-ink hover:brightness-95"
        >
          Book a session
        </Link>
      </div>
    </div>
  );
}
