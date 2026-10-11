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
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-xl border border-line bg-white p-8 text-center">
        <div className="text-6xl">✅</div>
        <h1 className="mt-4 text-2xl font-bold text-brand-green">Order confirmed!</h1>
        {order && (
          <div className="mt-3 space-y-1 text-sm text-ink-muted">
            <p>
              Order <span className="font-bold text-ink">#{order.order_no}</span>
            </p>
            {order.total?.amount && (
              <p>
                Total: <span className="font-bold text-ink">UGX {fmt(order.total.amount)}</span>
              </p>
            )}
            {order.placed_at && <p>Placed {new Date(order.placed_at).toLocaleString()}</p>}
          </div>
        )}
        <p className="mt-5 text-sm text-ink-muted">
          We'll contact you to arrange delivery and confirm payment details.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            to={`/orders/${id}/tracking`}
            className="rounded-lg bg-brand-green px-6 py-2.5 text-sm font-bold text-white hover:brightness-95"
          >
            Track this order
          </Link>
          <Link to="/store" className="text-sm text-brand-green hover:underline">
            Continue shopping
          </Link>
          <Link to="/portal/orders" className="text-sm text-brand-green hover:underline">
            View all my orders
          </Link>
        </div>
      </div>
    </div>
  );
}
