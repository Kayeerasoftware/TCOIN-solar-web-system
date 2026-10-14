import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import '../portal.css';

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

const STATUS_CLASS: Record<string, string> = {
  draft: 'pt-status pt-status-grey',
  sent: 'pt-status pt-status-amber',
  accepted: 'pt-status pt-status-green',
  expired: 'pt-status pt-status-red',
};

export default function Quotes() {
  const { data, isLoading } = useQuery({
    queryKey: ['portal-quotes-all'],
    queryFn: () => api.get('/quotes?limit=50').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  const quotes: {
    id: string;
    quote_no: string;
    status: string;
    valid_until?: string;
    version?: { total?: { amount: string; currency: string } };
  }[] = data ?? [];

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
        <div style={{ padding: '14px 22px 12px 0' }}>
          <h1>My Quotes</h1>
          <p>Solar system quotations prepared for your account. Click a row to view the full document.</p>
        </div>
      </div>

      {isLoading && (
        <div style={{ padding: 32 }}>
          <LoadingState />
        </div>
      )}

      {!isLoading && quotes.length === 0 && (
        <div className="pt-empty">
          <span className="pt-empty-icon">📋</span>
          <p>No quotes yet</p>
          <span>Contact us to get a quotation for your solar system.</span>
        </div>
      )}

      {!isLoading && quotes.length > 0 && (
        <>
          <div className="pt-row pt-row-head" style={{ gridTemplateColumns: '130px 1fr 130px 110px 80px' }}>
            <span>Quote No.</span>
            <span>Valid until</span>
            <span>Amount</span>
            <span style={{ justifyContent: 'center' }}>Status</span>
            <span style={{ justifyContent: 'center' }}>Open</span>
          </div>

          {quotes.map((q) => (
            <div key={q.id} className="pt-row" style={{ gridTemplateColumns: '130px 1fr 130px 110px 80px' }}>
              <span style={{ fontWeight: 700, fontSize: 12, color: '#1d2f25' }}>{q.quote_no}</span>
              <span style={{ fontSize: 11, color: '#69736d' }}>
                {q.valid_until
                  ? new Date(q.valid_until).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </span>
              <span style={{ fontWeight: 700, fontSize: 12 }}>
                {q.version?.total ? `UGX ${fmt(q.version.total.amount)}` : '—'}
              </span>
              <span style={{ justifyContent: 'center' }}>
                <span className={STATUS_CLASS[q.status] ?? 'pt-status pt-status-grey'}>{q.status}</span>
              </span>
              <span style={{ justifyContent: 'center' }}>
                <Link to={`/portal/quotes/${q.id}`} className="pt-link" style={{ fontSize: 11 }}>
                  View →
                </Link>
              </span>
            </div>
          ))}

          <div className="pt-doc-footer">
            <span>
              {quotes.length} quote{quotes.length !== 1 ? 's' : ''} on record
            </span>
            <span>E&amp;OE · Prices subject to site survey confirmation.</span>
          </div>
        </>
      )}
    </div>
  );
}
