import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;
const STEP_LABELS: Record<string, string> = {
  pending: 'Received',
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

  if (isLoading)
    return (
      <div style={{ padding: 40 }}>
        <LoadingState />
      </div>
    );
  if (!order)
    return (
      <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center', padding: '0 20px' }}>
        <p style={{ fontSize: 40 }}>🔍</p>
        <p style={{ fontWeight: 600, marginTop: 12 }}>Order not found.</p>
        <Link to="/portal/orders" style={{ color: '#1d6434', textDecoration: 'underline', fontSize: 13 }}>
          View my orders
        </Link>
      </div>
    );

  const currentIdx = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const isCancelled = order.status === 'cancelled';
  const pct = currentIdx >= 0 ? (currentIdx / (STEPS.length - 1)) * 100 : 0;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px 40px' }}>
      <h1 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>Order Tracking</h1>

      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 4, padding: 28 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 32,
          }}
        >
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>
              Order #{order.order_no}
            </p>
            {order.placed_at && (
              <p style={{ margin: 0, fontSize: 12, color: '#888' }}>
                Placed {new Date(order.placed_at).toLocaleDateString()}
              </p>
            )}
          </div>
          {order.total?.amount && (
            <span style={{ fontSize: 18, fontWeight: 900, color: '#1d6434' }}>
              UGX {fmt(order.total.amount)}
            </span>
          )}
        </div>

        {isCancelled ? (
          <div
            style={{
              padding: '14px 18px',
              background: '#fde8e8',
              borderLeft: '3px solid #c0392b',
              fontSize: 13,
              color: '#c0392b',
              fontWeight: 600,
              borderRadius: 3,
            }}
          >
            This order has been cancelled.
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
            {/* Track lines */}
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: 0,
                right: 0,
                height: 3,
                background: '#f0f0f0',
                borderRadius: 2,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: 0,
                height: 3,
                background: '#1d6434',
                borderRadius: 2,
                width: `${pct}%`,
                transition: 'width 400ms',
              }}
            />

            {STEPS.map((step, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <div
                  key={step}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      border: `2.5px solid ${done ? '#1d6434' : '#ddd'}`,
                      background: done ? '#1d6434' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: done ? 16 : 12,
                      color: done ? '#fff' : '#aaa',
                      transition: 'border-color 200ms, background 200ms',
                    }}
                  >
                    {done ? STEP_ICONS[step] : i + 1}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      textAlign: 'center',
                      maxWidth: 64,
                      lineHeight: 1.3,
                      fontWeight: active ? 700 : 400,
                      color: active ? '#1d6434' : done ? '#333' : '#aaa',
                    }}
                  >
                    {STEP_LABELS[step]}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Shipments */}
        {order.shipments?.map((s: { tracking_no: string; carrier: string; status: string }) => (
          <div
            key={s.tracking_no}
            style={{
              marginTop: 24,
              padding: '12px 16px',
              background: '#f8f8f8',
              borderRadius: 3,
              fontSize: 12,
            }}
          >
            <p style={{ margin: '0 0 3px', fontWeight: 600 }}>{s.carrier}</p>
            <p style={{ margin: 0, color: '#666' }}>
              Tracking: {s.tracking_no} · Status: {s.status}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
        <Link to="/store" style={{ fontSize: 13, color: '#1d6434', textDecoration: 'underline' }}>
          Continue shopping
        </Link>
        <Link to="/portal/orders" style={{ fontSize: 13, color: '#1d6434', textDecoration: 'underline' }}>
          All orders
        </Link>
      </div>
    </div>
  );
}
