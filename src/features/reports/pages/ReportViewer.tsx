import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { qk } from '@/api/queryKeys';
import { LoadingState } from '@/components/feedback/LoadingState';

const LABELS: Record<string, string> = {
  pipeline: 'Sales pipeline',
  conversion_by_source: 'Conversion by source',
  quote_win_rate: 'Quote win rate',
  project_status: 'Project status',
  project_margin: 'Project margin',
  stock_turnover: 'Stock turnover',
  reorder_alerts: 'Reorder alerts',
  receivables_ageing: 'Receivables ageing',
  revenue_by_service: 'Revenue by service',
  ticket_sla: 'Ticket SLA',
  warranty_expiry: 'Warranty expiry',
  contract_renewals: 'Contract renewals',
};

export default function ReportViewer() {
  const { name } = useParams<{ name: string }>();
  const { data, isLoading } = useQuery({
    queryKey: qk.report(name!),
    queryFn: () => api.get(`/reports/${name}`).then((r) => r.data),
    enabled: !!name,
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingState />;

  const rows: Record<string, unknown>[] = data?.rows ?? (Array.isArray(data) ? data : []);
  const cols = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">{LABELS[name!] ?? name}</h1>
      {rows.length === 0 && <p className="mt-6 text-ink-muted">No data for this report.</p>}
      {rows.length > 0 && (
        <div className="mt-6 rounded-lg border border-line bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
              <tr>
                {cols.map((c) => (
                  <th key={c} className="px-4 py-2 text-left capitalize">
                    {c.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-line last:border-0 hover:bg-surface-alt">
                  {cols.map((c) => (
                    <td key={c} className="px-4 py-2">
                      {String(row[c] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
