import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function Reconciliation() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reconciliation', date],
    queryFn: () => api.get('/payments/reconciliation', { params: { date } }).then((r) => r.data),
    enabled: !!date,
    staleTime: 60_000,
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-green">Reconciliation</h1>
      <div className="mt-4 flex items-end gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Date</label>
          <input
            type="date"
            className="rounded border border-line px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button
          onClick={() => refetch()}
          className="rounded border border-brand-green px-4 py-2 text-sm font-medium text-brand-green hover:bg-green-50"
        >
          Refresh
        </button>
      </div>
      {isLoading && <LoadingState />}
      {data && (
        <div className="mt-6 rounded-lg border border-line bg-white p-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Gateway settlements</span>
            <span className="font-bold">{data.gateway_total ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span>Recorded payments</span>
            <span className="font-bold">{data.recorded_total ?? '—'}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-3">
            <span className="font-bold">Difference</span>
            <span className={`font-bold ${data.difference === 0 ? 'text-brand-green' : 'text-brand-red'}`}>
              {data.difference ?? '—'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
