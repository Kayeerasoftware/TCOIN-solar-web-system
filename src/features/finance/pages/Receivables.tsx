import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function Receivables() {
  const { data, isLoading } = useQuery({
    queryKey: ['report-receivables'],
    queryFn: () => api.get('/reports/receivables_ageing').then((r) => r.data),
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingState />;

  const rows: {
    customer: string;
    current: number;
    days_30: number;
    days_60: number;
    days_90: number;
    over_90: number;
    total: number;
    currency: string;
  }[] = data?.rows ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Receivables ageing</h1>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-right">Current</th>
              <th className="px-4 py-2 text-right">1–30 days</th>
              <th className="px-4 py-2 text-right">31–60 days</th>
              <th className="px-4 py-2 text-right">61–90 days</th>
              <th className="px-4 py-2 text-right">&gt;90 days</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.customer} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 font-medium">{r.customer}</td>
                {[r.current, r.days_30, r.days_60, r.days_90, r.over_90, r.total].map((v, i) => (
                  <td
                    key={i}
                    className={`px-4 py-2 text-right ${i === 5 ? 'font-bold' : ''} ${i >= 3 && v > 0 ? 'text-brand-red' : ''}`}
                  >
                    {r.currency} {Number(v).toLocaleString()}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-muted">
                  No outstanding receivables.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
