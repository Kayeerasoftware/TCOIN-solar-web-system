import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import '../portal.css';

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

const STATUS_CLASS: Record<string, string> = {
  pending: 'pt-status pt-status-amber',
  confirmed: 'pt-status pt-status-green',
  shipped: 'pt-status pt-status-blue',
  delivered: 'pt-status pt-status-green',
  cancelled: 'pt-status pt-status-red',
};

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['portal-orders'],
    queryFn: () => api.get('/orders?limit=50').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  const orders: {
    id: string;
    order_no: string;
    status: string;
    placed_at?: string;
    total: { amount: string; currency: string };
  }[] = data ?? [];

  return (
    <div className="pt-doc">
      <div
        className="pt-page-head"
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: 0,
          minHeight: 72,
        }}
      >
        <img
          src="/brand/TCOIN LOGO OFFICIAL.svg"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            right: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            height: '160%',
            width: 'auto',
            opacity: 0.07,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
        <div
          style={{
            width: 72,
            height: 72,
            flexShrink: 0,
            background: '#f1f4f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ba19d',
            fontSize: 28,
          }}
        >
          📦
        </div>
        <div style={{ padding: '14px 0 12px 0', flex: 1 }}>
          <h1>My Orders</h1>
          <p>Store purchases and delivery status.</p>
        </div>
        <div style={{ padding: '0 22px', flexShrink: 0 }}>
          <Link
            to="/store"
            className="pt-btn-primary pt-btn-sm"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
          >
            Shop More →
          </Link>
        </div>
      </div>

      {isLoading && (
        <div style={{ padding: 32 }}>
          <LoadingState />
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="pt-empty">
          <span className="pt-empty-icon">📦</span>
          <p>No orders yet</p>
          <span>Browse our store to place your first order.</span>
          <br />
          <Link
            to="/store"
            className="pt-link"
            style={{ marginTop: 12, display: 'inline-block', fontSize: 12 }}
          >
            Browse Store →
          </Link>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <>
          {/* Table header */}
          <div className="pt-row pt-row-head" style={{ gridTemplateColumns: '120px 1fr 140px 100px 100px' }}>
            <span>Order No.</span>
            <span>Date placed</span>
            <span>Total</span>
            <span style={{ justifyContent: 'center' }}>Status</span>
            <span style={{ justifyContent: 'center' }}>Action</span>
          </div>

          {orders.map((o) => (
            <div key={o.id} className="pt-row" style={{ gridTemplateColumns: '120px 1fr 140px 100px 100px' }}>
              <span style={{ fontWeight: 700, fontSize: 12, color: '#1d2f25' }}>{o.order_no}</span>
              <span style={{ fontSize: 11, color: '#69736d' }}>
                {o.placed_at
                  ? new Date(o.placed_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </span>
              <span style={{ fontWeight: 700, fontSize: 12 }}>UGX {fmt(o.total?.amount ?? 0)}</span>
              <span style={{ justifyContent: 'center' }}>
                <span className={STATUS_CLASS[o.status] ?? 'pt-status pt-status-grey'}>{o.status}</span>
              </span>
              <span style={{ justifyContent: 'center' }}>
                <Link to={`/orders/${o.id}/tracking`} className="pt-link" style={{ fontSize: 11 }}>
                  Track →
                </Link>
              </span>
            </div>
          ))}

          <div className="pt-doc-footer">
            <span>
              {orders.length} order{orders.length !== 1 ? 's' : ''} on record
            </span>
          </div>
        </>
      )}
    </div>
  );
}
