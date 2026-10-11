import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function Suppliers() {
  const { data, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api.get('/suppliers').then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingState />;

  const suppliers: {
    id: string;
    code: string;
    name: string;
    currency: string;
    contact?: { email?: string; phone?: string };
  }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Suppliers</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s) => (
          <div key={s.id} className="rounded-lg border border-line bg-white p-4">
            <p className="font-bold">{s.name}</p>
            <p className="text-xs text-ink-muted">
              {s.code} · {s.currency}
            </p>
            {s.contact?.email && <p className="mt-1 text-xs text-ink-muted">{s.contact.email}</p>}
            {s.contact?.phone && <p className="text-xs text-ink-muted">{s.contact.phone}</p>}
          </div>
        ))}
        {suppliers.length === 0 && <p className="text-ink-muted">No suppliers configured.</p>}
      </div>
    </div>
  );
}
