import { Link } from 'react-router-dom';

const REPORTS = [
  { name: 'pipeline', label: 'Sales pipeline' },
  { name: 'conversion_by_source', label: 'Conversion by source' },
  { name: 'quote_win_rate', label: 'Quote win rate' },
  { name: 'project_status', label: 'Project status' },
  { name: 'project_margin', label: 'Project margin' },
  { name: 'stock_turnover', label: 'Stock turnover' },
  { name: 'reorder_alerts', label: 'Reorder alerts' },
  { name: 'receivables_ageing', label: 'Receivables ageing' },
  { name: 'revenue_by_service', label: 'Revenue by service' },
  { name: 'ticket_sla', label: 'Ticket SLA' },
  { name: 'warranty_expiry', label: 'Warranty expiry' },
  { name: 'contract_renewals', label: 'Contract renewals' },
];

export default function ReportsDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Reports</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <Link
            key={r.name}
            to={`/console/reports/${r.name}`}
            className="rounded-lg border border-line bg-white p-5 hover:shadow-md transition-shadow"
          >
            <p className="font-bold text-brand-green">{r.label}</p>
            <p className="mt-1 text-xs text-ink-muted">{r.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
