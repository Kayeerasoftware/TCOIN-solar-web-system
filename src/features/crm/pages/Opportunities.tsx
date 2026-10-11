import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function Opportunities() {
  const { data, isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => api.get('/opportunities?limit=100').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  const opps: {
    id: string;
    opp_no: string;
    title: string;
    stage: string;
    service_line?: string;
    expected_value?: { amount: string; currency: string };
    probability?: number;
  }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Opportunities</h1>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Opp #</th>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-left">Stage</th>
              <th className="px-4 py-2 text-right">Value</th>
              <th className="px-4 py-2 text-right">Prob %</th>
            </tr>
          </thead>
          <tbody>
            {opps.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 text-brand-green">{o.opp_no}</td>
                <td className="px-4 py-2 font-medium">{o.title}</td>
                <td className="px-4 py-2 text-ink-muted">{o.service_line ?? '—'}</td>
                <td className="px-4 py-2 capitalize">{o.stage}</td>
                <td className="px-4 py-2 text-right">
                  {o.expected_value
                    ? `${o.expected_value.currency} ${Number(o.expected_value.amount).toLocaleString()}`
                    : '—'}
                </td>
                <td className="px-4 py-2 text-right">{o.probability ?? '—'}</td>
              </tr>
            ))}
            {opps.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  No opportunities.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
