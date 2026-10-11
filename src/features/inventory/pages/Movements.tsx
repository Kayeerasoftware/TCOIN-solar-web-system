import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function Movements() {
  const { data, isLoading } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: () => api.get('/stock/movements?limit=100').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  const movements: {
    id: string;
    movement_type: string;
    quantity: number;
    unit_cost?: number;
    created_at?: string;
    particulars?: string;
    sku?: string;
  }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Stock movements</h1>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Item</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-right">Qty</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 text-ink-muted">
                  {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2">{m.particulars ?? m.sku ?? '—'}</td>
                <td className="px-4 py-2 capitalize text-ink-muted">{m.movement_type?.replace(/_/g, ' ')}</td>
                <td
                  className={`px-4 py-2 text-right font-medium ${m.quantity < 0 ? 'text-brand-red' : 'text-brand-green'}`}
                >
                  {m.quantity > 0 ? '+' : ''}
                  {m.quantity}
                </td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                  No movements.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
