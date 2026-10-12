import { useQuery } from '@tanstack/react-query';
import { getSummary } from '@/api/endpoints/platform';
import { StatCard } from '@/components/data/StatCard';
import { DataTable } from '@/components/data/DataTable';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Card } from '@/components/ui/Card';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatMoney } from '@/lib/money';

export default function ReportsDashboard() {
  useDocumentTitle('Dashboard');
  const q = useQuery({ queryKey: ['report', 'summary'], queryFn: getSummary });
  if (q.isLoading) return <LoadingState />;
  if (q.isError || !q.data)
    return <ErrorState message="Could not load the dashboard." onRetry={() => void q.refetch()} />;
  const s = q.data;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand-green">Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open quotes" value={String(s.open_quotes)} />
        <StatCard label="Pipeline value" value={formatMoney(s.pipeline_value)} />
        <StatCard label="Receivables" value={formatMoney(s.receivables)} />
        <StatCard label="Low-stock items" value={String(s.low_stock.length)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Leads by stage">
          <ul>
            {Object.entries(s.leads_by_status).map(([k, v]) => (
              <li key={k} className="flex justify-between border-b border-line py-1">
                <span>{k.replace('_', ' ')}</span>
                <b>{v}</b>
              </li>
            ))}
          </ul>
        </Card>
        <div>
          <h2 className="mb-2 font-bold">Low stock</h2>
          <DataTable
            rows={s.low_stock}
            rowKey={(r) => r.sku}
            emptyTitle="Nothing is low"
            columns={[
              { header: 'SKU', cell: (r) => r.sku },
              { header: 'Item', cell: (r) => r.name },
              { header: 'Available', align: 'right', cell: (r) => r.available },
              { header: 'Reorder at', align: 'right', cell: (r) => r.reorder_level },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
