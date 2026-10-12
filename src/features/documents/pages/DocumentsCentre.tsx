import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listReceipts } from '@/api/endpoints/documents';
import { listQuotes } from '@/api/endpoints/quotes';
import { qk } from '@/api/queryKeys';
import { DataTable } from '@/components/data/DataTable';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/lib/dates';
import { formatNumber } from '@/lib/money';

export default function DocumentsCentre() {
  useDocumentTitle('Documents');
  const quotes = useQuery({ queryKey: qk.quotes(), queryFn: listQuotes });
  const receipts = useQuery({ queryKey: qk.receipts(), queryFn: listReceipts });
  if (quotes.isLoading || receipts.isLoading) return <LoadingState />;
  const proformas = (quotes.data ?? []).filter((q) => q.proforma_no);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-green">Documents</h1>
      <div className="flex flex-wrap gap-3">
        <ButtonLink to="/console/quotes/new">New proforma invoice</ButtonLink>
        <ButtonLink to="/console/documents/receipt/new" variant="secondary">
          New receipt
        </ButtonLink>
        <ButtonLink to="/console/documents/voucher/new" variant="secondary">
          New payment voucher
        </ButtonLink>
        <ButtonLink to="/console/documents/delivery-note/new" variant="secondary">
          New delivery note
        </ButtonLink>
        <ButtonLink to="/console/documents/letter/new" variant="secondary">
          New letter
        </ButtonLink>
      </div>
      <section aria-labelledby="pf">
        <h2 id="pf" className="mb-2 font-bold">
          Proforma invoices
        </h2>
        <DataTable
          rows={proformas}
          rowKey={(q) => q.id}
          emptyTitle="No proforma invoices yet"
          columns={[
            { header: 'Number', cell: (q) => q.proforma_no },
            { header: 'To', cell: (q) => q.bill_to_text },
            { header: 'Date', cell: (q) => (q.issued_on ? formatDate(q.issued_on) : '') },
            { header: 'Total (UGX)', align: 'right', cell: (q) => formatNumber(q.total) },
            {
              header: 'Print',
              cell: (q) => (
                <Link to={`/print/proforma/${q.id}`} className="text-brand-green underline">
                  Print
                </Link>
              ),
            },
          ]}
        />
      </section>
      <section aria-labelledby="rc">
        <h2 id="rc" className="mb-2 font-bold">
          Receipts
        </h2>
        <DataTable
          rows={receipts.data ?? []}
          rowKey={(r) => r.id}
          emptyTitle="No receipts yet"
          emptyMessage="Issue a receipt when money is received."
          columns={[
            { header: 'Number', cell: (r) => r.receipt_no },
            { header: 'Type', cell: (r) => (r.receipt_type === 'corporate' ? 'Corporate' : 'Cash / sales') },
            { header: 'Received from', cell: (r) => r.received_from },
            { header: 'Date', cell: (r) => formatDate(r.receipt_date) },
            { header: 'Amount (UGX)', align: 'right', cell: (r) => formatNumber(r.amount) },
            {
              header: 'Print',
              cell: (r) => (
                <Link to={`/print/receipt/${r.id}`} className="text-brand-green underline">
                  Print
                </Link>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}
