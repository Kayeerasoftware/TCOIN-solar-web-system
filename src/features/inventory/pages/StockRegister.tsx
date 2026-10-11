import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { qk } from '@/api/queryKeys';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function StockRegister() {
  const [lowStock, setLowStock] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: qk.stock({ lowStock }),
    queryFn: () =>
      api
        .get('/stock', { params: { limit: 100, ...(lowStock ? { low_stock: true } : {}) } })
        .then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  const items: {
    variant_id: string;
    particulars: string;
    sku: string;
    warehouse_id: string;
    quantity: number;
    reserved: number;
    available: number;
    reorder_level?: number;
    unit: string;
  }[] = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green">Stock register</h1>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={lowStock} onChange={(e) => setLowStock(e.target.checked)} />
          Low stock only
        </label>
      </div>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Item</th>
              <th className="px-4 py-2 text-left">SKU</th>
              <th className="px-4 py-2 text-right">On hand</th>
              <th className="px-4 py-2 text-right">Reserved</th>
              <th className="px-4 py-2 text-right">Available</th>
              <th className="px-4 py-2 text-right">Reorder</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr
                key={`${s.variant_id}-${s.warehouse_id}`}
                className={`border-b border-line last:border-0 hover:bg-surface-alt ${s.reorder_level && s.available <= s.reorder_level ? 'bg-red-50' : ''}`}
              >
                <td className="px-4 py-2 font-medium">{s.particulars}</td>
                <td className="px-4 py-2 text-ink-muted">{s.sku}</td>
                <td className="px-4 py-2 text-right">
                  {s.quantity} {s.unit}
                </td>
                <td className="px-4 py-2 text-right text-ink-muted">{s.reserved}</td>
                <td
                  className={`px-4 py-2 text-right font-medium ${s.reorder_level && s.available <= s.reorder_level ? 'text-brand-red' : 'text-brand-green'}`}
                >
                  {s.available}
                </td>
                <td className="px-4 py-2 text-right text-ink-muted">{s.reorder_level ?? '—'}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  No stock records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
