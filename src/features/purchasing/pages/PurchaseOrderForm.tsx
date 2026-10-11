import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';

interface POLine {
  variant_id: string;
  quantity: string;
  unit_cost: string;
}

export default function PurchaseOrderForm() {
  const navigate = useNavigate();
  const [supplierId, setSupplierId] = useState('');
  const [currency, setCurrency] = useState('UGX');
  const [expectedDate, setExpectedDate] = useState('');
  const [lines, setLines] = useState<POLine[]>([{ variant_id: '', quantity: '1', unit_cost: '' }]);

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api.get('/suppliers').then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  const create = useMutation({
    mutationFn: () =>
      api.post('/purchase-orders', {
        supplier_id: supplierId,
        currency,
        expected_date: expectedDate || undefined,
        lines: lines
          .filter((l) => l.variant_id)
          .map((l) => ({ variant_id: l.variant_id, quantity: +l.quantity, unit_cost: +l.unit_cost })),
      }),
    onSuccess: () => navigate('/console/purchase-orders'),
  });

  function updateLine(i: number, k: keyof POLine, v: string) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-green">New purchase order</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
        className="mt-6 space-y-4"
      >
        {create.isError && (
          <p className="rounded bg-red-50 p-2 text-sm text-brand-red">Could not create PO. Check inputs.</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Supplier *</label>
            <select
              className="w-full rounded border border-line px-3 py-2 text-sm"
              required
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">Select supplier…</option>
              {(suppliers ?? []).map((s: { id: string; name: string }) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Currency *</label>
            <select
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {['UGX', 'USD', 'KES', 'EUR'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Expected date</label>
            <input
              type="date"
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </div>
        </div>

        <h2 className="font-bold">Lines</h2>
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <input
              className="col-span-1 rounded border border-line px-2 py-1.5 text-sm"
              placeholder="Variant ID *"
              required
              value={l.variant_id}
              onChange={(e) => updateLine(i, 'variant_id', e.target.value)}
            />
            <input
              className="rounded border border-line px-2 py-1.5 text-sm"
              placeholder="Qty"
              type="number"
              min="1"
              value={l.quantity}
              onChange={(e) => updateLine(i, 'quantity', e.target.value)}
            />
            <input
              className="rounded border border-line px-2 py-1.5 text-sm"
              placeholder="Unit cost"
              type="number"
              step="any"
              value={l.unit_cost}
              onChange={(e) => updateLine(i, 'unit_cost', e.target.value)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLines((ls) => [...ls, { variant_id: '', quantity: '1', unit_cost: '' }])}
          className="text-sm text-brand-green underline"
        >
          + Add line
        </button>

        <Button type="submit" busy={create.isPending} className="w-full">
          Create purchase order
        </Button>
      </form>
    </div>
  );
}
