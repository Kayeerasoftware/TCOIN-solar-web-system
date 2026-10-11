import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function Payments() {
  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments?limit=100').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  const payments: {
    id: string;
    payment_no: string;
    method: string;
    provider?: string;
    created_at?: string;
    amount?: { amount: string; currency: string };
  }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Payments</h1>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Payment #</th>
              <th className="px-4 py-2 text-left">Method</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 font-medium">{p.payment_no}</td>
                <td className="px-4 py-2 capitalize text-ink-muted">{p.method?.replace(/_/g, ' ')}</td>
                <td className="px-4 py-2 text-ink-muted">
                  {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  {p.amount ? `${p.amount.currency} ${Number(p.amount.amount).toLocaleString()}` : '—'}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
