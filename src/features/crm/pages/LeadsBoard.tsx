import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { qk } from '@/api/queryKeys';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';

const STAGES = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const STAGE_COLOR: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700',
  contacted: 'bg-yellow-50 text-yellow-700',
  qualified: 'bg-indigo-50 text-indigo-700',
  converted: 'bg-green-50 text-brand-green',
  lost: 'bg-gray-100 text-gray-500',
};

export default function LeadsBoard() {
  const [stage, setStage] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: qk.leads({ stage }),
    queryFn: () =>
      api
        .get('/leads', { params: { limit: 100, ...(stage ? { status: stage } : {}) } })
        .then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  const qc = useQueryClient();
  const convert = useMutation({
    mutationFn: (id: string) => api.post(`/leads/${id}/convert`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });

  if (isLoading) return <LoadingState />;

  const leads: {
    id: string;
    lead_no: string;
    full_name: string;
    phone?: string;
    email?: string;
    status: string;
    service_interest?: string;
    created_at: string;
  }[] = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green">Leads</h1>
        <Link to="/console/leads/new">
          <Button variant="secondary">+ New lead</Button>
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setStage('')}
          className={`rounded-full px-3 py-1 text-xs font-medium ${!stage ? 'bg-brand-green text-white' : 'bg-surface-alt text-ink-muted'}`}
        >
          All
        </button>
        {STAGES.map((s) => (
          <button
            key={s}
            onClick={() => setStage(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${stage === s ? 'bg-brand-green text-white' : 'bg-surface-alt text-ink-muted'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Lead #</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Contact</th>
              <th className="px-4 py-2 text-left">Interest</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2">
                  <Link to={`/console/leads/${l.id}`} className="text-brand-green underline">
                    {l.lead_no}
                  </Link>
                </td>
                <td className="px-4 py-2 font-medium">{l.full_name}</td>
                <td className="px-4 py-2 text-ink-muted">{l.phone ?? l.email ?? '—'}</td>
                <td className="px-4 py-2 text-ink-muted">{l.service_interest ?? '—'}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STAGE_COLOR[l.status] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-ink-muted">{new Date(l.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  {l.status !== 'converted' && l.status !== 'lost' && (
                    <Button
                      variant="secondary"
                      className="py-0.5 text-xs"
                      onClick={() => convert.mutate(l.id)}
                      busy={convert.isPending}
                    >
                      Convert
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-muted">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
