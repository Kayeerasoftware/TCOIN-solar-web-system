import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function Warehouses() {
  const { data, isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => api.get('/warehouses').then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingState />;

  const warehouses: { id: string; code: string; name: string; kind: string }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Warehouses</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {warehouses.map((w) => (
          <div key={w.id} className="rounded-lg border border-line bg-white p-4">
            <p className="font-bold">{w.name}</p>
            <p className="text-xs text-ink-muted">
              {w.code} · <span className="capitalize">{w.kind}</span>
            </p>
          </div>
        ))}
        {warehouses.length === 0 && <p className="text-ink-muted">No warehouses configured.</p>}
      </div>
    </div>
  );
}
