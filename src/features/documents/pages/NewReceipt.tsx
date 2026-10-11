import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, withIdempotency } from '@/api/client';
import { Button } from '@/components/ui/Button';

export default function NewReceipt() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    receipt_type: 'corporate',
    received_from: '',
    received_from_address: '',
    amount: '',
    currency: 'UGX',
    method: 'mobile_money',
    payment_for: '',
    invoice_id: '',
    cheque_no: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/receipts', form, withIdempotency());
      navigate('/console/documents');
    } catch {
      setError('Could not issue receipt.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-green">Issue receipt</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="rounded bg-red-50 p-2 text-sm text-brand-red">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Receipt type</label>
            <select
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={form.receipt_type}
              onChange={set('receipt_type')}
            >
              <option value="corporate">Corporate</option>
              <option value="cash_sales">Cash sales</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Method</label>
            <select
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={form.method}
              onChange={set('method')}
            >
              <option value="mobile_money">Mobile money</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Received from *</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            required
            value={form.received_from}
            onChange={set('received_from')}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Address</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            value={form.received_from_address}
            onChange={set('received_from_address')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Amount *</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              type="number"
              step="any"
              required
              value={form.amount}
              onChange={set('amount')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Currency</label>
            <select
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={form.currency}
              onChange={set('currency')}
            >
              {['UGX', 'USD', 'KES', 'EUR'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Being payment of</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            value={form.payment_for}
            onChange={set('payment_for')}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Invoice ID (optional)</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            value={form.invoice_id}
            onChange={set('invoice_id')}
          />
        </div>
        {form.method === 'cheque' && (
          <div>
            <label className="mb-1 block text-sm font-medium">Cheque number</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={form.cheque_no}
              onChange={set('cheque_no')}
            />
          </div>
        )}
        <Button type="submit" busy={busy} className="w-full">
          Issue receipt
        </Button>
      </form>
    </div>
  );
}
