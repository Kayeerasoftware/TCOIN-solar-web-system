import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, withIdempotency } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import { LineItemTable } from '@/components/line-items/LineItemTable';
import '../portal.css';

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

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

  if (isLoading)
    return (
      <div className="pt-doc" style={{ padding: 32 }}>
        <LoadingState />
      </div>
    );
  if (!quote)
    return (
      <div className="pt-doc">
        <div className="pt-empty">
          <p>Quote not found.</p>
        </div>
      </div>
    );

  const v = quote.version;
  const canAccept = quote.status === 'sent';

  const STATUS_CLASS: Record<string, string> = {
    draft: 'pt-status pt-status-grey',
    sent: 'pt-status pt-status-amber',
    accepted: 'pt-status pt-status-green',
    expired: 'pt-status pt-status-red',
  };

  return (
    <div className="pt-doc">
      <div
        className="pt-page-head"
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: 0,
          minHeight: 72,
        }}
      >
        <img
          src="/brand/TCOIN LOGO OFFICIAL.svg"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            right: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            height: '160%',
            width: 'auto',
            opacity: 0.07,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
        <div
          style={{
            width: 72,
            height: 72,
            flexShrink: 0,
            background: '#f1f4f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ba19d',
            fontSize: 28,
          }}
        >
          📋
        </div>
        <div style={{ padding: '14px 0 12px 0', flex: 1 }}>
          <h1>{quote.quote_no}</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={STATUS_CLASS[quote.status] ?? 'pt-status pt-status-grey'}>{quote.status}</span>
            {quote.valid_until && (
              <span>
                Valid until{' '}
                {new Date(quote.valid_until).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </p>
        </div>
        {canAccept && (
          <div style={{ padding: '0 22px', flexShrink: 0 }}>
            {!accepting ? (
              <button className="pt-btn-primary pt-btn-sm" onClick={() => setAccepting(true)}>
                Accept quote
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1d2f25' }}>Confirm acceptance?</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="pt-btn-secondary pt-btn-sm" onClick={() => setAccepting(false)}>
                    Cancel
                  </button>
                  <button
                    className="pt-btn-primary pt-btn-sm"
                    onClick={() => accept.mutate()}
                    disabled={accept.isPending}
                  >
                    {accept.isPending ? '…' : 'Confirm'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {v && (
        <>
          <div style={{ padding: '0 22px' }}>
            <LineItemTable items={v.lines ?? []} currency={quote.currency} />
          </div>

          {/* Totals */}
          <div
            style={{
              borderTop: '1px solid #9ba19d',
              padding: '12px 22px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 4,
            }}
          >
            {[
              { label: 'Subtotal', value: `${quote.currency} ${fmt(v.subtotal?.amount ?? 0)}`, muted: true },
              Number(v.discount_amount?.amount) > 0
                ? {
                    label: 'Discount',
                    value: `−${quote.currency} ${fmt(v.discount_amount.amount)}`,
                    red: true,
                  }
                : null,
              { label: 'Tax', value: `${quote.currency} ${fmt(v.tax_amount?.amount ?? 0)}`, muted: true },
            ]
              .filter(Boolean)
              .map(
                (row) =>
                  row && (
                    <div
                      key={row.label}
                      style={{
                        display: 'flex',
                        gap: 24,
                        fontSize: 12,
                        color: (row as { red?: boolean }).red ? '#d92c32' : '#69736d',
                      }}
                    >
                      <span>{row.label}</span>
                      <span style={{ fontWeight: 700, minWidth: 120, textAlign: 'right' }}>{row.value}</span>
                    </div>
                  ),
              )}
            <div
              style={{
                display: 'flex',
                gap: 24,
                fontSize: 15,
                fontWeight: 900,
                color: '#1d2f25',
                fontFamily: 'Georgia, serif',
                borderTop: '2px solid #173b28',
                paddingTop: 8,
                marginTop: 4,
              }}
            >
              <span>Total</span>
              <span style={{ minWidth: 120, textAlign: 'right' }}>
                {quote.currency} {fmt(v.total?.amount ?? 0)}
              </span>
            </div>
          </div>
        </>
      )}

      <div className="pt-doc-footer">
        <span>E&amp;OE · Prices subject to site survey confirmation.</span>
        <a href={`/api/v1/quotes/${id}/pdf`} target="_blank" rel="noreferrer" className="pt-link">
          Download PDF →
        </a>
      </div>
    </div>
  );
}
