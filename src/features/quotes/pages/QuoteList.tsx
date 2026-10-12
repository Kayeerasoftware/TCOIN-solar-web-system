import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listCustomers } from '@/api/endpoints/crm';
import { listQuotes } from '@/api/endpoints/quotes';
import { qk } from '@/api/queryKeys';
import { DataTable } from '@/components/data/DataTable';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatNumber } from '@/lib/money';
import type { QuoteStatus } from '@/types/api';

const tone: Record<QuoteStatus, 'green' | 'amber' | 'red' | 'grey'> = {
  draft: 'grey',
  pending_approval: 'amber',
  sent: 'green',
  accepted: 'green',
  rejected: 'red',
  expired: 'red',
  superseded: 'grey',
};

export default function QuoteList() {
  useDocumentTitle('Quotes');
  const quotes = useQuery({ queryKey: qk.quotes(), queryFn: listQuotes });
  const customers = useQuery({ queryKey: ['customers'], queryFn: listCustomers });
  if (quotes.isLoading) return <LoadingState />;
  if (quotes.isError)
    return <ErrorState message="Could not load quotes." onRetry={() => void quotes.refetch()} />;
  const name = (id: string) => customers.data?.find((c) => c.id === id)?.display_name ?? '';
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green">Quotes</h1>
        <ButtonLink to="/console/quotes/new">New quote</ButtonLink>
      </div>
      <DataTable
        rows={quotes.data ?? []}
        rowKey={(q) => q.id}
        emptyTitle="No quotes yet"
        emptyMessage="Create the first quote to issue a Proforma Invoice."
        columns={[
          {
            header: 'Number',
            cell: (q) => (
              <Link to={`/console/quotes/${q.id}`} className="font-medium text-brand-green underline">
                {q.proforma_no ? `Proforma ${q.proforma_no}` : q.quote_no}
              </Link>
            ),
          },
          { header: 'Customer', cell: (q) => name(q.customer_id) },
          { header: 'Title', cell: (q) => q.document_title },
          {
            header: 'Status',
            cell: (q) => <Badge tone={tone[q.status]}>{q.status.replace('_', ' ')}</Badge>,
          },
          { header: 'Total (UGX)', align: 'right', cell: (q) => formatNumber(q.total) },
          {
            header: 'Print',
            cell: (q) =>
              q.proforma_no ? (
                <Link to={`/print/proforma/${q.id}`} className="text-brand-green underline">
                  Print
                </Link>
              ) : (
                <span className="text-ink-muted">Not issued</span>
              ),
          },
        ]}
      />
    </div>
  );
}
