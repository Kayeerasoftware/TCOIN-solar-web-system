import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';

interface VoucherLine {
  ref_no: string;
  description: string;
  amount: string;
}

export default function NewVoucher() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pay_to: '',
    currency: 'UGX',
    method: 'bank_transfer',
    bank_account: '',
    cheque_no: '',
  });
  const [lines, setLines] = useState<VoucherLine[]>([{ ref_no: '', description: '', amount: '' }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  function updateLine(i: number, k: keyof VoucherLine, v: string) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/payment-vouchers', { ...form, lines: lines.filter((l) => l.description) });
      navigate('/console/documents');
    } catch {
      setError('Could not create voucher.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-green">New payment voucher</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="rounded bg-red-50 p-2 text-sm text-brand-red">{error}</p>}
        <div>
          <label className="mb-1 block text-sm font-medium">Pay to *</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            required
            value={form.pay_to}
            onChange={set('pay_to')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Method</label>
            <select
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={form.method}
              onChange={set('method')}
            >
              <option value="bank_transfer">Bank transfer</option>
              <option value="cheque">Cheque</option>
              <option value="cash">Cash</option>
            </select>
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
        {form.method === 'bank_transfer' && (
          <div>
            <label className="mb-1 block text-sm font-medium">Bank account</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={form.bank_account}
              onChange={set('bank_account')}
            />
          </div>
        )}
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
        <h2 className="font-bold">Lines</h2>
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <input
              className="rounded border border-line px-2 py-1.5 text-sm"
              placeholder="Ref #"
              value={l.ref_no}
              onChange={(e) => updateLine(i, 'ref_no', e.target.value)}
            />
            <input
              className="rounded border border-line px-2 py-1.5 text-sm"
              placeholder="Description *"
              required
              value={l.description}
              onChange={(e) => updateLine(i, 'description', e.target.value)}
            />
            <input
              className="rounded border border-line px-2 py-1.5 text-sm"
              placeholder="Amount"
              type="number"
              step="any"
              value={l.amount}
              onChange={(e) => updateLine(i, 'amount', e.target.value)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLines((ls) => [...ls, { ref_no: '', description: '', amount: '' }])}
          className="text-sm text-brand-green underline"
        >
          + Add line
        </button>
        <Button type="submit" busy={busy} className="w-full">
          Create voucher
        </Button>
      </form>
    </div>
  );
}
