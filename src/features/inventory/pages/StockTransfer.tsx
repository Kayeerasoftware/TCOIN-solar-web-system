import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';

export default function StockTransfer() {
  const [form, setForm] = useState({
    variant_id: '',
    from_warehouse_id: '',
    to_warehouse_id: '',
    quantity: '',
    reason: '',
  });

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  const transfer = useMutation({
    mutationFn: () =>
      api.post('/stock/transfers', {
        variant_id: form.variant_id,
        from_warehouse_id: form.from_warehouse_id,
        to_warehouse_id: form.to_warehouse_id,
        quantity: +form.quantity,
        reason: form.reason,
      }),
    onSuccess: () =>
      setForm({ variant_id: '', from_warehouse_id: '', to_warehouse_id: '', quantity: '', reason: '' }),
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-green">Stock transfer</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          transfer.mutate();
        }}
        className="mt-6 space-y-4"
      >
        {transfer.isSuccess && (
          <p className="rounded bg-green-50 p-2 text-sm text-brand-green">Transfer recorded.</p>
        )}
        {transfer.isError && (
          <p className="rounded bg-red-50 p-2 text-sm text-brand-red">Transfer failed. Check inputs.</p>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium">Variant ID *</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            required
            value={form.variant_id}
            onChange={set('variant_id')}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">From warehouse *</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              required
              value={form.from_warehouse_id}
              onChange={set('from_warehouse_id')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">To warehouse *</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              required
              value={form.to_warehouse_id}
              onChange={set('to_warehouse_id')}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Quantity *</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            type="number"
            min="1"
            required
            value={form.quantity}
            onChange={set('quantity')}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Reason</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            value={form.reason}
            onChange={set('reason')}
          />
        </div>
        <Button type="submit" busy={transfer.isPending} className="w-full">
          Record transfer
        </Button>
      </form>
    </div>
  );
}
