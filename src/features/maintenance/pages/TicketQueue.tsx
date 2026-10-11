import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { qk } from '@/api/queryKeys';
import { LoadingState } from '@/components/feedback/LoadingState';

const STATUS_COLOR: Record<string, string> = {
  open: 'bg-yellow-50 text-yellow-700',
  responded: 'bg-blue-50 text-blue-700',
  resolving: 'bg-indigo-50 text-indigo-700',
  resolved: 'bg-green-50 text-brand-green',
  closed: 'bg-gray-100 text-gray-500',
};

export default function TicketQueue() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: qk.tickets({ status }),
    queryFn: () =>
      api
        .get('/tickets', { params: { limit: 100, ...(status ? { status } : {}) } })
        .then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  const tickets: {
    id: string;
    ticket_no: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    sla_response_due?: string;
  }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Ticket queue</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {['', 'open', 'responded', 'resolving', 'resolved', 'closed'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${status === s ? 'bg-brand-green text-white' : 'bg-surface-alt text-ink-muted'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Ticket #</th>
              <th className="px-4 py-2 text-left">Subject</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Priority</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Response due</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2">
                  <Link to={`/console/tickets/${t.id}`} className="text-brand-green underline">
                    {t.ticket_no}
                  </Link>
                </td>
                <td className="px-4 py-2 font-medium">{t.subject}</td>
                <td className="px-4 py-2 text-ink-muted">{t.category}</td>
                <td className="px-4 py-2 capitalize text-ink-muted">{t.priority}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLOR[t.status] ?? 'bg-gray-100'}`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-ink-muted text-xs">
                  {t.sla_response_due ? new Date(t.sla_response_due).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
