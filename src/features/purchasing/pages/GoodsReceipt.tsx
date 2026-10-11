import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';

interface GRLine {
  po_line_id: string;
  variant_id: string;
  quantity: string;
  serial_numbers: string;
}

export default function GoodsReceipt() {
  const navigate = useNavigate();
  const [poId, setPoId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [deliveryNoteNo, setDeliveryNoteNo] = useState('');
  const [lines, setLines] = useState<GRLine[]>([
    { po_line_id: '', variant_id: '', quantity: '', serial_numbers: '' },
  ]);

  const receive = useMutation({
    mutationFn: () =>
      api.post(`/purchase-orders/${poId}/receive`, {
        warehouse_id: warehouseId,
        delivery_note_no: deliveryNoteNo,
        lines: lines
          .filter((l) => l.variant_id)
          .map((l) => ({
            po_line_id: l.po_line_id || undefined,
            variant_id: l.variant_id,
            quantity: +l.quantity,
            serial_numbers: l.serial_numbers
              ? l.serial_numbers
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [],
          })),
      }),
    onSuccess: () => navigate('/console/purchase-orders'),
  });

  function updateLine(i: number, k: keyof GRLine, v: string) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-green">Receive goods</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          receive.mutate();
        }}
        className="mt-6 space-y-4"
      >
        {receive.isError && (
          <p className="rounded bg-red-50 p-2 text-sm text-brand-red">
            Could not record receipt. Check inputs.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Purchase order ID *</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              required
              value={poId}
              onChange={(e) => setPoId(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Warehouse ID *</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              required
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Supplier delivery note #</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={deliveryNoteNo}
              onChange={(e) => setDeliveryNoteNo(e.target.value)}
            />
          </div>
        </div>

        <h2 className="font-bold">Items received</h2>
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <input
              className="rounded border border-line px-2 py-1.5 text-sm"
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
              className="col-span-2 rounded border border-line px-2 py-1.5 text-sm"
              placeholder="Serial numbers (comma-separated)"
              value={l.serial_numbers}
              onChange={(e) => updateLine(i, 'serial_numbers', e.target.value)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setLines((ls) => [...ls, { po_line_id: '', variant_id: '', quantity: '', serial_numbers: '' }])
          }
          className="text-sm text-brand-green underline"
        >
          + Add item
        </button>

        <Button type="submit" busy={receive.isPending} className="w-full">
          Record goods receipt
        </Button>
      </form>
    </div>
  );
}
