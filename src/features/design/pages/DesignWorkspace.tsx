import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { LineItemTable } from '@/components/line-items/LineItemTable';
import { Badge } from '@/components/ui/Badge';

const STATUS_TONE: Record<string, 'green' | 'amber' | 'grey'> = {
  draft: 'grey',
  approved: 'green',
  superseded: 'amber',
};

export default function DesignWorkspace() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [approving, setApproving] = useState(false);

  const { data: design, isLoading } = useQuery({
    queryKey: ['design', id],
    queryFn: () => api.get(`/designs/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const { data: bom } = useQuery({
    queryKey: ['design-bom', id],
    queryFn: () => api.get(`/designs/${id}/bom`).then((r) => r.data.data ?? []),
    enabled: !!id,
  });

  const approve = useMutation({
    mutationFn: () => api.patch(`/designs/${id}`, { status: 'approved' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['design', id] });
      setApproving(false);
    },
  });

  const createQuote = useMutation({
    mutationFn: () => api.post('/quotes', { design_id: id, customer_id: design?.customer_id }),
    onSuccess: (res) => {
      window.location.href = `/console/quotes/${res.data.id}`;
    },
  });

  if (isLoading) return <LoadingState />;
  if (!design) return <p className="p-8 text-ink-muted">Design not found.</p>;

  const r = design.results;
  const warnings: string[] = design.warnings ?? [];

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{design.design_no}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge tone={STATUS_TONE[design.status] ?? 'grey'}>{design.status}</Badge>
            <span className="text-sm text-ink-muted capitalize">{design.system_type?.replace('_', '-')}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {design.status === 'draft' &&
            (!approving ? (
              <Button onClick={() => setApproving(true)}>Approve design</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setApproving(false)}>
                  Cancel
                </Button>
                <Button onClick={() => approve.mutate()} busy={approve.isPending}>
                  Confirm approve
                </Button>
              </div>
            ))}
          {design.status === 'approved' && (
            <Button onClick={() => createQuote.mutate()} busy={createQuote.isPending}>
              Create quote →
            </Button>
          )}
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-700">Sizing warnings</p>
          <ul className="mt-2 space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-sm text-amber-700">
                ⚠ {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {r && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Daily load', value: `${r.energy?.dailyWh?.toFixed(0) ?? '—'} Wh` },
            { label: 'Array', value: `${r.array?.kwp ?? '—'} kWp` },
            { label: 'Battery', value: r.battery?.kwh ? `${r.battery.kwh} kWh` : 'None' },
            { label: 'Inverter', value: `${r.inverter?.kw ?? '—'} kW` },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-line bg-white p-4">
              <p className="text-xs text-ink-muted">{s.label}</p>
              <p className="mt-1 text-xl font-bold text-brand-green">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {bom && bom.length > 0 && (
        <div>
          <h2 className="mb-3 font-bold">Bill of materials</h2>
          <LineItemTable items={bom} currency="UGX" showImages={false} />
        </div>
      )}

      {design.overrides && Object.keys(design.overrides).length > 0 && (
        <div className="rounded-lg border border-line bg-white p-4 text-sm">
          <p className="font-bold">Parameter overrides</p>
          <pre className="mt-2 text-xs text-ink-muted overflow-x-auto">
            {JSON.stringify(design.overrides, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex gap-4 text-sm">
        <Link to="/console/surveys" className="text-brand-green hover:underline">
          ← Back to surveys
        </Link>
      </div>
    </div>
  );
}
