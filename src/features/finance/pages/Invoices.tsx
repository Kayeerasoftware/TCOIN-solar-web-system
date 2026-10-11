import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { qk } from '@/api/queryKeys';
import { LoadingState } from '@/components/feedback/LoadingState';

const PAY_COLOR: Record<string, string> = {
  unpaid: 'bg-red-50 text-brand-red',
  partial: 'bg-yellow-50 text-yellow-700',
  paid: 'bg-green-50 text-brand-green',
  overpaid: 'bg-indigo-50 text-indigo-700',
};

export default function Invoices() {
  const [payState, setPayState] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: qk.invoices({ payState }),
    queryFn: () =>
      api
        .get('/invoices', { params: { limit: 100, ...(payState ? { payment_state: payState } : {}) } })
        .then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  const invoices: {
    id: string;
    invoice_no: string;
    issue_date?: string;
    due_date?: string;
    total: { amount: string; currency: string };
    balance: { amount: string };
    payment_state: string;
  }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Invoices</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {['', 'unpaid', 'partial', 'paid'].map((s) => (
          <button
            key={s}
            onClick={() => setPayState(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${payState === s ? 'bg-brand-green text-white' : 'bg-surface-alt text-ink-muted'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Invoice #</th>
              <th className="px-4 py-2 text-left">Issued</th>
              <th className="px-4 py-2 text-left">Due</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-right">Balance</th>
              <th className="px-4 py-2 text-left">State</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2">
                  <Link to={`/console/invoices/${inv.id}`} className="text-brand-green underline">
                    {inv.invoice_no}
                  </Link>
                </td>
                <td className="px-4 py-2 text-ink-muted">
                  {inv.issue_date ? new Date(inv.issue_date).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2 text-ink-muted">
                  {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  {inv.total?.currency} {Number(inv.total?.amount ?? 0).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right">
                  {inv.total?.currency} {Number(inv.balance?.amount ?? 0).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PAY_COLOR[inv.payment_state] ?? 'bg-gray-100'}`}
                  >
                    {inv.payment_state}
                  </span>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
