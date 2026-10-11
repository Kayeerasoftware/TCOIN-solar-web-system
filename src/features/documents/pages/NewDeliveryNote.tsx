import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';

interface DNLine {
  item_no: string;
  description: string;
  quantity: string;
  unit: string;
}

export default function NewDeliveryNote() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    deliver_to_name: '',
    deliver_to_address: '',
    contact_info: '',
    customer_id: '',
    order_id: '',
  });
  const [lines, setLines] = useState<DNLine[]>([
    { item_no: '', description: '', quantity: '1', unit: 'pcs' },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  function updateLine(i: number, k: keyof DNLine, v: string) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/delivery-notes', {
        ...form,
        customer_id: form.customer_id || undefined,
        order_id: form.order_id || undefined,
        lines: lines.filter((l) => l.description).map((l) => ({ ...l, quantity: +l.quantity })),
      });
      navigate('/console/documents');
    } catch {
      setError('Could not create delivery note.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-green">New delivery note</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="rounded bg-red-50 p-2 text-sm text-brand-red">{error}</p>}
        <div>
          <label className="mb-1 block text-sm font-medium">Deliver to (name) *</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            required
            value={form.deliver_to_name}
            onChange={set('deliver_to_name')}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Delivery address</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            value={form.deliver_to_address}
            onChange={set('deliver_to_address')}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Contact info</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            value={form.contact_info}
            onChange={set('contact_info')}
          />
        </div>
        <h2 className="font-bold">Items</h2>
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-4 gap-2">
            <input
              className="rounded border border-line px-2 py-1.5 text-sm"
              placeholder="Item #"
              value={l.item_no}
              onChange={(e) => updateLine(i, 'item_no', e.target.value)}
            />
            <input
              className="col-span-2 rounded border border-line px-2 py-1.5 text-sm"
              placeholder="Description *"
              required
              value={l.description}
              onChange={(e) => updateLine(i, 'description', e.target.value)}
            />
            <input
              className="rounded border border-line px-2 py-1.5 text-sm"
              placeholder="Qty"
              type="number"
              min="1"
              value={l.quantity}
              onChange={(e) => updateLine(i, 'quantity', e.target.value)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setLines((ls) => [...ls, { item_no: '', description: '', quantity: '1', unit: 'pcs' }])
          }
          className="text-sm text-brand-green underline"
        >
          + Add item
        </button>
        <Button type="submit" busy={busy} className="w-full">
          Create delivery note
        </Button>
      </form>
    </div>
  );
}
