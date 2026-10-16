import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import '../portal.css';

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

type Invoice = {
  id: string;
  invoice_no: string;
  issue_date?: string;
  due_date?: string;
  total: { amount: string; currency: string };
  balance: { amount: string };
  payment_state: string;
};

const STATUS_CLASS: Record<string, string> = {
  paid: 'pt-status pt-status-green',
  partial: 'pt-status pt-status-amber',
  unpaid: 'pt-status pt-status-red',
};

function PayModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const pay = useMutation({
    mutationFn: () => api.post(`/invoices/${invoice.id}/pay`, {}),
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '2px solid #173b28',
          width: 420,
          maxWidth: '95vw',
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: '#9ba19d',
                marginBottom: 4,
              }}
            >
              Pay Invoice
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#1d2f25', fontFamily: 'Georgia,serif' }}>
              {invoice.invoice_no}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              color: '#69736d',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            border: '1px solid #28312c',
            background: '#28312c',
          }}
        >
          {[
            { label: 'Invoice total', value: `UGX ${fmt(invoice.total?.amount ?? 0)}` },
            { label: 'Balance due', value: `UGX ${fmt(invoice.balance?.amount ?? 0)}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#fff', padding: '10px 14px' }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: '#69736d',
                  marginBottom: 3,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#1d2f25' }}>{value}</div>
            </div>
          ))}
        </div>

        {pay.isSuccess ? (
          <div className="pt-alert pt-alert-green" style={{ margin: 0 }}>
            <span>✅ {(pay.data as { data: { instructions: string } }).data.instructions}</span>
          </div>
        ) : (
          <>
            {pay.isError && (
              <div className="pt-alert pt-alert-red" style={{ margin: 0 }}>
                <span>Could not initiate payment. Please try again.</span>
              </div>
            )}
            <p style={{ margin: 0, fontSize: 13, color: '#69736d' }}>
              You will be prompted to complete payment via <strong>MTN Mobile Money (*165#)</strong> or{' '}
              <strong>Airtel Money (*185#)</strong>.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="pt-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="pt-btn-primary" onClick={() => pay.mutate()} disabled={pay.isPending}>
                {pay.isPending ? 'Initiating…' : 'Pay Now →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Invoices() {
  const [payTarget, setPayTarget] = useState<Invoice | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['portal-invoices'],
    queryFn: () => api.get('/invoices?limit=50').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  const invoices: Invoice[] = data ?? [];

  return (
    <div className="pt-doc">
      {payTarget && <PayModal invoice={payTarget} onClose={() => setPayTarget(null)} />}

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
          🧾
        </div>
        <div style={{ padding: '14px 22px 12px 0' }}>
          <h1>My Invoices</h1>
          <p>Invoices issued for your orders and projects.</p>
        </div>
      </div>

      {isLoading && (
        <div style={{ padding: 32 }}>
          <LoadingState />
        </div>
      )}

      {!isLoading && invoices.length === 0 && (
        <div className="pt-empty">
          <span className="pt-empty-icon">🧾</span>
          <p>No invoices yet</p>
          <span>Invoices for your orders and projects will appear here.</span>
        </div>
      )}

      {!isLoading && invoices.length > 0 && (
        <>
          <div
            className="pt-row pt-row-head"
            style={{ gridTemplateColumns: '140px 100px 100px 150px 140px 100px 90px' }}
          >
            <span>Invoice No.</span>
            <span>Issued</span>
            <span>Due</span>
            <span>Total</span>
            <span>Balance Due</span>
            <span style={{ justifyContent: 'center' }}>Status</span>
            <span style={{ justifyContent: 'center' }}>Actions</span>
          </div>

          {invoices.map((inv) => {
            const balanceAmt = Number(inv.balance?.amount ?? 0);
            const unpaid = inv.payment_state !== 'paid' && balanceAmt > 0;
            const overdue = unpaid && inv.due_date && new Date(inv.due_date) < new Date();

            return (
              <div
                key={inv.id}
                className="pt-row"
                style={{
                  gridTemplateColumns: '140px 100px 100px 150px 140px 100px 90px',
                  background: overdue ? '#fff8f8' : undefined,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 12, color: '#1d2f25' }}>{inv.invoice_no}</span>
                <span style={{ fontSize: 11, color: '#69736d' }}>{fmtDate(inv.issue_date)}</span>
                <span
                  style={{
                    fontSize: 11,
                    color: overdue ? '#d92c32' : '#69736d',
                    fontWeight: overdue ? 700 : 400,
                  }}
                >
                  {fmtDate(inv.due_date)}
                  {overdue && (
                    <span style={{ marginLeft: 4, fontSize: 10, fontWeight: 800, color: '#d92c32' }}>
                      OVERDUE
                    </span>
                  )}
                </span>
                <span style={{ fontWeight: 700, fontSize: 12 }}>UGX {fmt(inv.total?.amount ?? 0)}</span>
                <span
                  style={{
                    fontSize: 12,
                    color: unpaid ? '#d92c32' : '#69736d',
                    fontWeight: unpaid ? 700 : 400,
                  }}
                >
                  {unpaid ? `UGX ${fmt(balanceAmt)}` : '—'}
                </span>
                <span style={{ justifyContent: 'center' }}>
                  <span className={STATUS_CLASS[inv.payment_state] ?? 'pt-status pt-status-grey'}>
                    {inv.payment_state}
                  </span>
                </span>
                <span style={{ justifyContent: 'center', gap: 8 }}>
                  {unpaid && (
                    <button
                      className="pt-btn-primary pt-btn-sm"
                      style={{ height: 28, padding: '0 10px', fontSize: 11 }}
                      onClick={() => setPayTarget(inv)}
                    >
                      Pay
                    </button>
                  )}
                  <a
                    href={`/api/invoices/${inv.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="pt-link"
                    style={{ fontSize: 11 }}
                  >
                    PDF ↓
                  </a>
                </span>
              </div>
            );
          })}

          <div className="pt-doc-footer">
            <span>
              {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
            </span>
            <span>E&amp;OE</span>
          </div>
        </>
      )}
    </div>
  );
}
