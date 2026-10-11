import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  approved: 'bg-blue-50 text-blue-700',
  sent: 'bg-indigo-50 text-indigo-700',
  partial: 'bg-yellow-50 text-yellow-700',
  received: 'bg-green-50 text-brand-green',
  cancelled: 'bg-red-50 text-brand-red',
};

export default function PurchaseOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => api.get('/purchase-orders?limit=100').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  const orders: {
    id: string;
    po_no: string;
    status: string;
    expected_date?: string;
    currency: string;
    created_at?: string;
  }[] = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green">Purchase orders</h1>
        <Link to="/console/purchase-orders/new">
          <Button variant="secondary">+ New PO</Button>
        </Link>
      </div>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">PO #</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Expected</th>
              <th className="px-4 py-2 text-left">Currency</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 font-medium text-brand-green">{o.po_no}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLOR[o.status] ?? 'bg-gray-100'}`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-ink-muted">{o.expected_date ?? '—'}</td>
                <td className="px-4 py-2 text-ink-muted">{o.currency}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                  No purchase orders.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
