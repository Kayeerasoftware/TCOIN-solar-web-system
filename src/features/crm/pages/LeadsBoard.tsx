import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listLeads, updateLead } from '@/api/endpoints/crm';
import { qk } from '@/api/queryKeys';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { LEAD_STATUSES, type LeadStatus } from '@/types/api';

const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');

export default function LeadsBoard() {
  useDocumentTitle('Leads');
  const qc = useQueryClient();
  const q = useQuery({ queryKey: qk.leads(), queryFn: () => listLeads() });
  const move = useMutation({
    mutationFn: (v: { id: string; status: LeadStatus }) => updateLead(v.id, { status: v.status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.leads() }),
  });
  if (q.isLoading) return <LoadingState />;
  if (q.isError) return <ErrorState message="Could not load leads." onRetry={() => void q.refetch()} />;
  if (!q.data?.length)
    return (
      <EmptyState title="No leads yet" message="Leads from the website calculator and forms appear here." />
    );
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand-green">Leads</h1>
      {move.isError && (
        <p role="alert" className="text-brand-red">
          Could not move that lead.
        </p>
      )}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {LEAD_STATUSES.map((s) => {
          const items = q.data.filter((l) => l.status === s);
          return (
            <section key={s} aria-label={label(s)} className="w-60 shrink-0 rounded-lg bg-slate-100 p-2">
              <h2 className="mb-2 px-1 font-bold">
                {label(s)} <span className="text-ink-muted">({items.length})</span>
              </h2>
              <ul className="space-y-2">
                {items.map((l) => (
                  <li key={l.id} className="rounded-md border border-line bg-white p-2 text-sm">
                    <b>{l.full_name}</b>
                    <div className="text-ink-muted">
                      {[l.location, l.service_interest].filter(Boolean).join(' | ')}
                    </div>
                    <select
                      aria-label={`Move ${l.full_name}`}
                      value={l.status}
                      onChange={(e) => move.mutate({ id: l.id, status: e.target.value as LeadStatus })}
                      className="mt-2 w-full rounded border border-line p-1"
                    >
                      {LEAD_STATUSES.map((x) => (
                        <option key={x} value={x}>
                          {label(x)}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
