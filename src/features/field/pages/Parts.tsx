import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface PartEntry {
  description: string;
  quantity: string;
  serial: string;
}

export default function Parts() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [parts, setParts] = useState<PartEntry[]>([{ description: '', quantity: '1', serial: '' }]);

  function update(i: number, k: keyof PartEntry, v: string) {
    setParts((p) => p.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));
  }

  function addRow() {
    setParts((p) => [...p, { description: '', quantity: '1', serial: '' }]);
  }

  function removeRow(i: number) {
    setParts((p) => p.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Parts &amp; serial numbers</h1>
      <div className="space-y-3">
        {parts.map((row, i) => (
          <div key={i} className="rounded-lg border border-line bg-white p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-muted">Item {i + 1}</span>
              {parts.length > 1 && (
                <button onClick={() => removeRow(i)} className="text-xs text-brand-red">
                  Remove
                </button>
              )}
            </div>
            <input
              className="w-full rounded border border-line px-2 py-1.5 text-sm"
              placeholder="Description / SKU"
              value={row.description}
              onChange={(e) => update(i, 'description', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="rounded border border-line px-2 py-1.5 text-sm"
                placeholder="Qty"
                type="number"
                min="1"
                value={row.quantity}
                onChange={(e) => update(i, 'quantity', e.target.value)}
              />
              <input
                className="rounded border border-line px-2 py-1.5 text-sm"
                placeholder="Serial no."
                value={row.serial}
                onChange={(e) => update(i, 'serial', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={addRow}
        className="w-full rounded border border-dashed border-brand-green py-2 text-sm text-brand-green"
      >
        + Add part
      </button>
      <Button className="w-full" onClick={() => navigate(`/field/jobs/${id}/commissioning`)}>
        Continue to commissioning →
      </Button>
    </div>
  );
}
