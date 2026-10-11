import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function CreditNotes() {
  const { data, isLoading } = useQuery({
    queryKey: ['credit-notes'],
    queryFn: () =>
      api
        .get('/credit-notes?limit=100')
        .then((r) => r.data.data ?? [])
        .catch(() => []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  const notes: {
    id: string;
    cn_no: string;
    reason: string;
    amount: { amount: string; currency: string };
    created_at?: string;
  }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Credit notes</h1>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">CN #</th>
              <th className="px-4 py-2 text-left">Reason</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((n) => (
              <tr key={n.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 font-medium">{n.cn_no}</td>
                <td className="px-4 py-2 text-ink-muted">{n.reason}</td>
                <td className="px-4 py-2 text-ink-muted">
                  {n.created_at ? new Date(n.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  {n.amount?.currency} {Number(n.amount?.amount ?? 0).toLocaleString()}
                </td>
              </tr>
            ))}
            {notes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                  No credit notes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
