import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function WorkOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ['work-orders'],
    queryFn: () => api.get('/work-orders?limit=100').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  const orders: {
    id: string;
    wo_no: string;
    wo_type: string;
    status: string;
    scheduled_start?: string;
    is_billable: boolean;
  }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Work orders</h1>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">WO #</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Scheduled</th>
              <th className="px-4 py-2 text-left">Billable</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 font-medium text-brand-green">{o.wo_no}</td>
                <td className="px-4 py-2 capitalize text-ink-muted">{o.wo_type?.replace(/_/g, ' ')}</td>
                <td className="px-4 py-2 capitalize">{o.status}</td>
                <td className="px-4 py-2 text-ink-muted">
                  {o.scheduled_start ? new Date(o.scheduled_start).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2">{o.is_billable ? '✓' : '—'}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  No work orders.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
