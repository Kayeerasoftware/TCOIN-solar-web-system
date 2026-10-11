import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, withIdempotency } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/feedback/LoadingState';
import { LineItemTable } from '@/components/line-items/LineItemTable';

export default function QuoteViewer() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [accepting, setAccepting] = useState(false);

  const { data: quote, isLoading } = useQuery({
    queryKey: ['quote', id],
    queryFn: () => api.get(`/quotes/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const accept = useMutation({
    mutationFn: () => api.post(`/quotes/${id}/accept`, {}, withIdempotency()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quote', id] });
      setAccepting(false);
    },
  });

  if (isLoading) return <LoadingState />;
  if (!quote) return <p className="p-8 text-ink-muted">Quote not found.</p>;

  const v = quote.version;
  const canAccept = quote.status === 'sent';

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-green">{quote.quote_no}</h1>
          <p className="text-sm text-ink-muted capitalize">Status: {quote.status}</p>
          {quote.valid_until && (
            <p className="text-sm text-ink-muted">
              Valid until {new Date(quote.valid_until).toLocaleDateString()}
            </p>
          )}
        </div>
        {canAccept && (
          <div>
            {!accepting ? (
              <Button onClick={() => setAccepting(true)}>Accept quote</Button>
            ) : (
              <div className="space-y-2 text-right">
                <p className="text-sm font-medium">Confirm acceptance?</p>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setAccepting(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => accept.mutate()} busy={accept.isPending}>
                    Confirm
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {v && (
        <div className="mt-6">
          <LineItemTable items={v.lines ?? []} currency={quote.currency} />
          <div className="mt-4 space-y-1 text-right text-sm">
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
          </div>
        </div>
      )}

      <div className="mt-6">
        <a
          href={`/api/v1/quotes/${id}/pdf`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-brand-green underline"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
