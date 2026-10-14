import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const { data: order } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px' }}>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e8e8e8',
          borderRadius: 4,
          padding: '48px 40px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 64 }}>✅</div>
        <h1 style={{ margin: '16px 0 8px', fontSize: 24, fontWeight: 900, color: '#1d6434' }}>
          Order confirmed!
        </h1>
        {order && (
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.8 }}>
            <p style={{ margin: 0 }}>
              Order <strong style={{ color: '#1a1a1a' }}>#{order.order_no}</strong>
            </p>
            {order.total?.amount && (
              <p style={{ margin: 0 }}>
                Total: <strong style={{ color: '#1d6434' }}>UGX {fmt(order.total.amount)}</strong>
              </p>
            )}
            {order.placed_at && (
              <p style={{ margin: 0 }}>Placed {new Date(order.placed_at).toLocaleString()}</p>
            )}
          </div>
        )}
        <p style={{ margin: '16px 0 28px', fontSize: 13, color: '#888' }}>
          We'll contact you to arrange delivery and confirm payment details.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link
            to={`/orders/${id}/tracking`}
            style={{
              display: 'block',
              padding: '12px 0',
              background: '#1d6434',
              color: '#fff',
              borderRadius: 4,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Track this order
          </Link>
          <Link to="/store" style={{ fontSize: 13, color: '#1d6434', textDecoration: 'underline' }}>
            Continue shopping
          </Link>
          <Link to="/portal/orders" style={{ fontSize: 13, color: '#1d6434', textDecoration: 'underline' }}>
            View all my orders
          </Link>
        </div>
      </div>
    </div>
  );
}
