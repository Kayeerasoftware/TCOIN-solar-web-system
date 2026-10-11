import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

export default function ConsultationServices() {
  const { data, isLoading } = useQuery({
    queryKey: ['consultation-services'],
    queryFn: () => api.get('/consultation-services').then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingState />;
  const services: {
    id: string;
    code: string;
    name: string;
    description: string;
    duration_min: number;
    price: { amount: string; currency: string };
  }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Consultation services</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div key={s.id} className="rounded-lg border border-line bg-white p-5 space-y-2">
            <p className="font-bold text-brand-green">{s.name}</p>
            <p className="text-xs font-mono text-ink-muted">{s.code}</p>
            <p className="text-sm text-ink-muted">{s.description}</p>
            <div className="flex items-center justify-between pt-2 border-t border-line">
              <span className="text-xs text-ink-muted">{s.duration_min} min</span>
              <span className="font-bold text-brand-green">
                {s.price.currency} {fmt(s.price.amount)}
              </span>
            </div>
            <Link
              to={`/console/consultancy/bookings?service_id=${s.id}`}
              className="block text-center rounded border border-brand-green py-1.5 text-sm font-medium text-brand-green hover:bg-green-50"
            >
              View bookings
            </Link>
          </div>
        ))}
        {services.length === 0 && <p className="text-ink-muted">No consultation services configured.</p>}
      </div>
    </div>
  );
}
