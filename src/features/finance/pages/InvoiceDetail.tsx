import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, withIdempotency } from '@/api/client';
import { qk } from '@/api/queryKeys';
import { LoadingState } from '@/components/feedback/LoadingState';
import { LineItemTable } from '@/components/line-items/LineItemTable';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState('bank_transfer');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const {
    data: inv,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: qk.invoices({ id }),
    queryFn: () => api.get(`/invoices/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  async function recordPayment() {
    setBusy(true);
    try {
      await api.post(
        '/payments',
        { invoice_id: id, method, amount: amount || inv?.balance?.amount, currency: inv?.currency },
        withIdempotency(),
      );
      refetch();
      setPaying(false);
    } catch {
      alert('Could not record payment.');
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <LoadingState />;
  if (!inv) return <p className="p-8 text-ink-muted">Invoice not found.</p>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{inv.invoice_no}</h1>
          <p className="text-sm text-ink-muted capitalize">{inv.payment_state}</p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/v1/invoices/${id}/pdf`} target="_blank" rel="noreferrer">
            <Button variant="secondary">PDF</Button>
          </a>
          {inv.payment_state !== 'paid' && !paying && (
            <Button onClick={() => setPaying(true)}>Record payment</Button>
          )}
        </div>
      </div>

      <LineItemTable items={inv.lines ?? []} currency={inv.currency} />

      <div className="space-y-1 text-right text-sm">
        <p>
          Subtotal: {inv.currency} {Number(inv.subtotal?.amount ?? 0).toLocaleString()}
        </p>
        <p>
          Tax: {inv.currency} {Number(inv.tax_total?.amount ?? 0).toLocaleString()}
        </p>
        <p className="text-lg font-bold">
          Total: {inv.currency} {Number(inv.total?.amount ?? 0).toLocaleString()}
        </p>
        <p>
          Paid: {inv.currency} {Number(inv.paid?.amount ?? 0).toLocaleString()}
        </p>
        <p className="font-bold text-brand-red">
          Balance: {inv.currency} {Number(inv.balance?.amount ?? 0).toLocaleString()}
        </p>
      </div>

      {paying && (
        <div className="rounded-lg border border-line bg-white p-4 space-y-3">
          <h2 className="font-bold">Record offline payment</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Method</label>
              <select
                className="w-full rounded border border-line px-3 py-2 text-sm"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="bank_transfer">Bank transfer</option>
                <option value="mobile_money">Mobile money</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Amount (leave blank for full balance)</label>
              <input
                className="w-full rounded border border-line px-3 py-2 text-sm"
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={inv.balance?.amount}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setPaying(false)}>
              Cancel
            </Button>
            <Button onClick={recordPayment} busy={busy}>
              Save payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
