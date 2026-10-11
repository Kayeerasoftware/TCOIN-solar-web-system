import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { qk } from '@/api/queryKeys';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-50 text-blue-700',
  accepted: 'bg-green-50 text-brand-green',
  expired: 'bg-red-50 text-brand-red',
};

export default function QuoteList() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: qk.quotes({ status }),
    queryFn: () =>
      api
        .get('/quotes', { params: { limit: 100, ...(status ? { status } : {}) } })
        .then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  const quotes: {
    id: string;
    quote_no: string;
    status: string;
    valid_until?: string;
    currency: string;
    version?: { total?: { amount: string } };
  }[] = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green">Quotes</h1>
        <Link to="/console/quotes/new">
          <Button variant="secondary">+ New quote</Button>
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {['', 'draft', 'sent', 'accepted', 'expired'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${status === s ? 'bg-brand-green text-white' : 'bg-surface-alt text-ink-muted'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Quote #</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Valid until</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2">
                  <Link to={`/console/quotes/${q.id}`} className="text-brand-green underline">
                    {q.quote_no}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLOR[q.status] ?? 'bg-gray-100'}`}
                  >
                    {q.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-ink-muted">
                  {q.valid_until ? new Date(q.valid_until).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  {q.currency} {q.version?.total ? Number(q.version.total.amount).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link to={`/console/quotes/${q.id}`}>
                    <Button variant="secondary" className="py-0.5 text-xs">
                      Open
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  No quotes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
