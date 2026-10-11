import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['portal-orders'],
    queryFn: () => api.get('/orders?limit=50').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">My orders</h1>
      {(data ?? []).length === 0 && (
        <p className="mt-6 text-ink-muted">
          No orders yet.{' '}
          <Link to="/store" className="text-brand-green underline">
            Browse the store
          </Link>
        </p>
      )}
      <div className="mt-6 space-y-3">
        {(data ?? []).map(
          (o: {
            id: string;
            order_no: string;
            status: string;
            placed_at?: string;
            total: { amount: string; currency: string };
          }) => (
            <div
              key={o.id}
              className="flex items-center justify-between rounded-lg border border-line bg-white p-4"
            >
              <div>
                <p className="font-bold">{o.order_no}</p>
                {o.placed_at && (
                  <p className="text-xs text-ink-muted">{new Date(o.placed_at).toLocaleDateString()}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {o.total?.currency} {Number(o.total?.amount).toLocaleString()}
                </span>
                <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs capitalize">{o.status}</span>
                <Link to={`/orders/${o.id}/tracking`}>
                  <Button variant="secondary" className="py-1 text-xs">
                    Track
                  </Button>
                </Link>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
