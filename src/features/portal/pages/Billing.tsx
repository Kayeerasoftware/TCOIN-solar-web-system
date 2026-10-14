import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, withIdempotency } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import '../portal.css';

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
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

export default function Billing() {
  const { data, isLoading } = useQuery({
    queryKey: ['portal-invoices-all'],
    queryFn: () => api.get('/invoices?limit=50').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  const invoices: Invoice[] = data ?? [];
  const totalBalance = invoices.reduce((s, i) => s + Number(i.balance?.amount ?? 0), 0);

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
          ₤
        </div>
        <div style={{ padding: '14px 0 12px 0', flex: 1 }}>
          <h1>Billing</h1>
          <p>Invoices and payment history for your account.</p>
        </div>
        {totalBalance > 0 && (
          <div style={{ padding: '0 22px', textAlign: 'right', flexShrink: 0 }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#d92c32',
                marginBottom: 2,
              }}
            >
              Outstanding balance
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 900, color: '#d92c32' }}>
              UGX {fmt(totalBalance)}
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div style={{ padding: 32 }}>
          <LoadingState />
        </div>
      )}

      {!isLoading && invoices.length === 0 && (
        <div className="pt-empty">
          <span className="pt-empty-icon">₤</span>
          <p>No invoices yet</p>
        </div>
      )}

      {!isLoading && invoices.length > 0 && (
        <>
          <div
            className="pt-row pt-row-head"
            style={{ gridTemplateColumns: '130px 120px 120px 140px 120px 80px 120px' }}
          >
            <span>Invoice No.</span>
            <span>Issue date</span>
            <span>Due date</span>
            <span>Total</span>
            <span>Balance</span>
            <span style={{ justifyContent: 'center' }}>Status</span>
            <span style={{ justifyContent: 'center' }}>Action</span>
          </div>

          {invoices.map((inv) => (
            <InvoiceRow
              key={inv.id}
              inv={inv}
              statusClass={STATUS_CLASS[inv.payment_state] ?? 'pt-status pt-status-grey'}
            />
          ))}

          <div className="pt-doc-footer">
            <span>
              {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} on record
            </span>
            <span>E&amp;OE · Contact us if you have a billing query.</span>
          </div>
        </>
      )}
    </div>
  );
}

function InvoiceRow({ inv, statusClass }: { inv: Invoice; statusClass: string }) {
  const [paying, setPaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const unpaid = inv.payment_state !== 'paid' && Number(inv.balance?.amount) > 0;

  async function pay() {
    setBusy(true);
    try {
      const { data } = await api.post(
        `/invoices/${inv.id}/pay`,
        { method: 'mobile_money' },
        withIdempotency(),
      );
      if (data.checkout_url) window.open(data.checkout_url, '_blank');
      else alert(data.instructions ?? 'Payment initiated. Check your phone.');
    } catch {
      alert('Could not initiate payment. Please try again.');
    } finally {
      setBusy(false);
      setPaying(false);
    }
  }

  return (
    <div className="pt-row" style={{ gridTemplateColumns: '130px 120px 120px 140px 120px 80px 120px' }}>
      <span style={{ fontWeight: 700, fontSize: 12, color: '#1d2f25' }}>{inv.invoice_no}</span>
      <span style={{ fontSize: 11, color: '#69736d' }}>
        {inv.issue_date
          ? new Date(inv.issue_date).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '—'}
      </span>
      <span style={{ fontSize: 11, color: '#69736d' }}>
        {inv.due_date
          ? new Date(inv.due_date).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '—'}
      </span>
      <span style={{ fontWeight: 700, fontSize: 12 }}>UGX {fmt(inv.total?.amount ?? 0)}</span>
      <span style={{ fontSize: 12, color: unpaid ? '#d92c32' : '#69736d', fontWeight: unpaid ? 700 : 400 }}>
        {unpaid ? `UGX ${fmt(inv.balance?.amount ?? 0)}` : '—'}
      </span>
      <span style={{ justifyContent: 'center' }}>
        <span className={statusClass}>{inv.payment_state}</span>
      </span>
      <span style={{ justifyContent: 'center', gap: 6 }}>
        {unpaid && !paying && (
          <button className="pt-btn-primary pt-btn-sm" onClick={() => setPaying(true)}>
            Pay now
          </button>
        )}
        {unpaid && paying && (
          <>
            <button className="pt-btn-secondary pt-btn-sm" onClick={() => setPaying(false)}>
              Cancel
            </button>
            <button
              className="pt-btn-primary pt-btn-sm"
              onClick={pay}
              disabled={busy}
              style={{ marginLeft: 4 }}
            >
              {busy ? '…' : 'Confirm'}
            </button>
          </>
        )}
        {!unpaid && <span style={{ fontSize: 11, color: '#9ba19d' }}>Paid ✓</span>}
      </span>
    </div>
  );
}
