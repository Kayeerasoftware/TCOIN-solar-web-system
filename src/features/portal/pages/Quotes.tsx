import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-50 text-blue-700',
  accepted: 'bg-green-50 text-brand-green',
  expired: 'bg-red-50 text-brand-red',
};

export default function Quotes() {
  const { data, isLoading } = useQuery({
    queryKey: ['portal-quotes-all'],
    queryFn: () => api.get('/quotes?limit=50').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">My quotes</h1>
      {(data ?? []).length === 0 && (
        <p className="mt-6 text-ink-muted">No quotes yet. Contact us to get started.</p>
      )}
      <div className="mt-6 space-y-3">
        {(data ?? []).map(
          (q: {
            id: string;
            quote_no: string;
            status: string;
            valid_until?: string;
            version?: { total?: { amount: string; currency: string } };
          }) => (
            <Link
              key={q.id}
              to={`/portal/quotes/${q.id}`}
              className="flex items-center justify-between rounded-lg border border-line bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-bold">{q.quote_no}</p>
                {q.valid_until && (
                  <p className="text-xs text-ink-muted">
                    Valid until {new Date(q.valid_until).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                {q.version?.total && (
                  <span className="font-medium">
                    {q.version.total.currency} {Number(q.version.total.amount).toLocaleString()}
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLOR[q.status] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {q.status}
                </span>
              </div>
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
