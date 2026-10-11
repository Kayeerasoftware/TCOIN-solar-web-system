import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function Customer360() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.get(`/customers/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) return <LoadingState />;
  if (!data) return <p className="p-8 text-ink-muted">Customer not found.</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{data.display_name}</h1>
        <p className="text-sm text-ink-muted">
          {data.customer_no} · <span className="capitalize">{data.customer_type}</span>
        </p>
      </div>
      <div className="rounded-lg border border-line bg-white p-5 grid grid-cols-2 gap-3 text-sm">
        {[
          ['Legal name', data.legal_name],
          ['Email', data.email],
          ['Phone', data.phone],
          ['Tax ID', data.tax_id],
          ['Currency', data.preferred_currency],
          ['Since', data.created_at ? new Date(data.created_at).toLocaleDateString() : null],
        ].map(([k, v]) =>
          v ? (
            <div key={k as string}>
              <p className="text-xs text-ink-muted">{k}</p>
              <p className="font-medium">{v}</p>
            </div>
          ) : null,
        )}
      </div>
      {data.billing_address && (
        <div className="rounded-lg border border-line bg-white p-4 text-sm">
          <p className="font-medium mb-1">Billing address</p>
          <p className="text-ink-muted whitespace-pre-line">
            {typeof data.billing_address === 'string'
              ? data.billing_address
              : JSON.stringify(data.billing_address, null, 2)}
          </p>
        </div>
      )}
    </div>
  );
}
