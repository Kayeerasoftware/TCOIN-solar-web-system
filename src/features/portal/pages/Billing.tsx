import { useQuery } from '@tanstack/react-query';
import { api, withIdempotency } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

export default function Billing() {
  const { data, isLoading } = useQuery({
    queryKey: ['portal-invoices-all'],
    queryFn: () => api.get('/invoices?limit=50').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Billing</h1>
      {(data ?? []).length === 0 && <p className="mt-6 text-ink-muted">No invoices yet.</p>}
      <div className="mt-6 space-y-3">
        {(data ?? []).map(
          (inv: {
            id: string;
            invoice_no: string;
            issue_date?: string;
            due_date?: string;
            total: { amount: string; currency: string };
            balance: { amount: string };
            payment_state: string;
          }) => (
            <InvoiceRow key={inv.id} inv={inv} />
          ),
        )}
      </div>
    </div>
  );
}

function InvoiceRow({
  inv,
}: {
  inv: {
    id: string;
    invoice_no: string;
    issue_date?: string;
    due_date?: string;
    total: { amount: string; currency: string };
    balance: { amount: string };
    payment_state: string;
  };
}) {
  const [paying, setPaying] = useState(false);
  const [busy, setBusy] = useState(false);

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

  const unpaid = inv.payment_state !== 'paid' && Number(inv.balance?.amount) > 0;

  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold">{inv.invoice_no}</p>
          <p className="text-xs text-ink-muted">
            {inv.issue_date && `Issued ${new Date(inv.issue_date).toLocaleDateString()}`}
            {inv.due_date && ` · Due ${new Date(inv.due_date).toLocaleDateString()}`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold">
            {inv.total?.currency} {fmt(inv.total?.amount ?? 0)}
          </p>
          <span className={`text-xs ${inv.payment_state === 'paid' ? 'text-green-600' : 'text-brand-red'}`}>
            {inv.payment_state}
          </span>
        </div>
      </div>
      {unpaid && (
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <p className="text-sm text-ink-muted">
            Balance: {inv.total?.currency} {fmt(inv.balance?.amount ?? 0)}
          </p>
          {!paying ? (
            <Button onClick={() => setPaying(true)} variant="secondary" className="text-sm py-1">
              Pay now
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setPaying(false)} className="text-sm py-1">
                Cancel
              </Button>
              <Button onClick={pay} busy={busy} className="text-sm py-1">
                Confirm payment
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
