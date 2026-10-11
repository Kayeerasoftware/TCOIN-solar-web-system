import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function PriceLists() {
  const { data, isLoading } = useQuery({
    queryKey: ['price-lists'],
    queryFn: () => api.get('/price-lists').then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingState />;
  const lists: { id: string; code: string; name: string; currency: string; customer_type?: string }[] =
    data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Price lists</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((pl) => (
          <div key={pl.id} className="rounded-lg border border-line bg-white p-4">
            <p className="font-bold">{pl.name}</p>
            <p className="text-xs font-mono text-ink-muted">{pl.code}</p>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="rounded bg-surface-alt px-2 py-0.5">{pl.currency}</span>
              {pl.customer_type && (
                <span className="rounded bg-surface-alt px-2 py-0.5 capitalize">{pl.customer_type}</span>
              )}
            </div>
          </div>
        ))}
        {lists.length === 0 && <p className="text-ink-muted">No price lists configured.</p>}
      </div>
    </div>
  );
}
