import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;
const STEP_LABELS: Record<string, string> = {
  pending: 'Order received',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
};
const STEP_ICONS: Record<string, string> = {
  pending: '📋',
  confirmed: '✅',
  processing: '📦',
  shipped: '🚚',
  delivered: '🏠',
};

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data),
    enabled: !!id,
    refetchInterval: 30_000,
  });

  if (isLoading) return <LoadingState />;
  if (!order)
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-4xl">🔍</p>
        <p className="mt-4 font-medium">Order not found.</p>
        <Link to="/portal/orders" className="mt-2 block text-brand-green underline">
          View my orders
        </Link>
      </div>
    );

  const currentIdx = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-green">Order tracking</h1>

      <div className="mt-6 rounded-xl border border-line bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold">Order #{order.order_no}</p>
            {order.placed_at && (
              <p className="text-sm text-ink-muted">
                Placed {new Date(order.placed_at).toLocaleDateString()}
              </p>
            )}
          </div>
          {order.total?.amount && <p className="font-bold text-brand-green">UGX {fmt(order.total.amount)}</p>}
        </div>

        {isCancelled ? (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-brand-red font-medium">
            Order cancelled
          </div>
        ) : (
          <div className="mt-8">
            <div className="relative flex justify-between">
              {/* Progress line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-surface-alt" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-brand-green transition-all"
                style={{ width: currentIdx >= 0 ? `${(currentIdx / (STEPS.length - 1)) * 100}%` : '0%' }}
              />

              {STEPS.map((step, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={step} className="relative flex flex-col items-center gap-2 z-10">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg transition-colors
                      ${done ? 'border-brand-green bg-brand-green' : 'border-line bg-white'}`}
                    >
                      {done ? (
                        <span className="text-white text-sm">{STEP_ICONS[step]}</span>
                      ) : (
                        <span className="text-ink-muted text-xs">{i + 1}</span>
                      )}
                    </div>
                    <p
                      className={`text-xs text-center max-w-[60px] leading-tight ${active ? 'font-bold text-brand-green' : done ? 'text-ink' : 'text-ink-muted'}`}
                    >
                      {STEP_LABELS[step]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Shipment info */}
        {order.shipments?.map((s: { tracking_no: string; carrier: string; status: string }) => (
          <div key={s.tracking_no} className="mt-6 rounded-lg bg-surface-alt p-4 text-sm">
            <p className="font-medium">{s.carrier}</p>
            <p className="text-ink-muted">Tracking: {s.tracking_no}</p>
            <p className="text-ink-muted capitalize">Status: {s.status}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4 text-sm">
        <Link to="/store" className="text-brand-green hover:underline">
          Continue shopping
        </Link>
        <Link to="/portal/orders" className="text-brand-green hover:underline">
          All orders
        </Link>
      </div>
    </div>
  );
}
