import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { qk } from '@/api/queryKeys';
import { LoadingState } from '@/components/feedback/LoadingState';
import { LineItemTable } from '@/components/line-items/LineItemTable';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function QuoteBuilder() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [sending, setSending] = useState(false);

  const { data: quote, isLoading } = useQuery({
    queryKey: qk.quote(id!),
    queryFn: () => api.get(`/quotes/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const send = useMutation({
    mutationFn: () => api.post(`/quotes/${id}/send`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.quote(id!) });
      setSending(false);
    },
  });

  const issueProforma = useMutation({
    mutationFn: () => api.post(`/quotes/${id}/proforma`, { validity_days: 30 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.quote(id!) }),
  });

  if (isLoading) return <LoadingState />;
  if (!quote) return <p className="p-8 text-ink-muted">Quote not found.</p>;

  const v = quote.version;
  const canSend = quote.status === 'draft';

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{quote.quote_no}</h1>
          <p className="text-sm text-ink-muted capitalize">
            Status: {quote.status} · Version {quote.current_version}
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/v1/quotes/${id}/pdf`} target="_blank" rel="noreferrer">
            <Button variant="secondary">PDF</Button>
          </a>
          <Button variant="secondary" onClick={() => issueProforma.mutate()} busy={issueProforma.isPending}>
            Issue proforma
          </Button>
          {canSend &&
            (!sending ? (
              <Button onClick={() => setSending(true)}>Send to customer</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setSending(false)}>
                  Cancel
                </Button>
                <Button onClick={() => send.mutate()} busy={send.isPending}>
                  Confirm send
                </Button>
              </div>
            ))}
        </div>
      </div>

      {v && (
        <>
          <LineItemTable items={v.lines ?? []} currency={quote.currency} />
          <div className="space-y-1 text-right text-sm">
            <p>
              Subtotal: {quote.currency} {Number(v.subtotal?.amount ?? 0).toLocaleString()}
            </p>
            {Number(v.discount_amount?.amount) > 0 && (
              <p className="text-brand-red">
                Discount: −{quote.currency} {Number(v.discount_amount.amount).toLocaleString()}
              </p>
            )}
            <p>
              Tax: {quote.currency} {Number(v.tax_amount?.amount ?? 0).toLocaleString()}
            </p>
            <p className="text-lg font-bold text-brand-green">
              Total: {quote.currency} {Number(v.total?.amount ?? 0).toLocaleString()}
            </p>
            {v.margin_pct !== undefined && <p className="text-ink-muted">Margin: {v.margin_pct}%</p>}
          </div>
        </>
      )}

      <div className="flex gap-3">
        <a href={`/console/quotes/${id}/versions`} className="text-sm text-brand-green underline">
          Version history
        </a>
      </div>
    </div>
  );
}
