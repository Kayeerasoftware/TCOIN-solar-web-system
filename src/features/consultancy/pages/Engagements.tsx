import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

const STATUS_TONE: Record<string, 'green' | 'amber' | 'grey'> = {
  active: 'green',
  completed: 'grey',
  draft: 'amber',
};

export default function Engagements() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['engagements'],
    queryFn: () =>
      api
        .get('/engagements?limit=100')
        .then((r) => r.data.data ?? [])
        .catch(() => []),
    staleTime: 30_000,
  });

  const [delivering, setDelivering] = useState<string | null>(null);
  const [delivTitle, setDelivTitle] = useState('');
  const [delivDocId, setDelivDocId] = useState('');

  const deliver = useMutation({
    mutationFn: (engId: string) =>
      api.post(`/engagements/${engId}/deliverables`, {
        title: delivTitle,
        document_id: delivDocId || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['engagements'] });
      setDelivering(null);
      setDelivTitle('');
      setDelivDocId('');
    },
  });

  if (isLoading) return <LoadingState />;
  const engagements: { id: string; title: string; scope?: string; status: string; customer_id: string }[] =
    data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Engagements</h1>
      <div className="mt-6 space-y-4">
        {engagements.map((e) => (
          <div key={e.id} className="rounded-lg border border-line bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold">{e.title}</p>
                {e.scope && <p className="mt-1 text-sm text-ink-muted">{e.scope}</p>}
              </div>
              <Badge tone={STATUS_TONE[e.status] ?? 'grey'}>{e.status}</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" className="py-1 text-xs" onClick={() => setDelivering(e.id)}>
                + Deliverable
              </Button>
            </div>
            {delivering === e.id && (
              <div className="mt-3 space-y-2 rounded border border-line p-3">
                <input
                  className="w-full rounded border border-line px-2 py-1.5 text-sm"
                  placeholder="Deliverable title *"
                  value={delivTitle}
                  onChange={(ev) => setDelivTitle(ev.target.value)}
                />
                <input
                  className="w-full rounded border border-line px-2 py-1.5 text-sm"
                  placeholder="Document ID (optional)"
                  value={delivDocId}
                  onChange={(ev) => setDelivDocId(ev.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="secondary" className="py-1 text-xs" onClick={() => setDelivering(null)}>
                    Cancel
                  </Button>
                  <Button
                    className="py-1 text-xs"
                    onClick={() => deliver.mutate(e.id)}
                    busy={deliver.isPending}
                    disabled={!delivTitle}
                  >
                    Deliver
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {engagements.length === 0 && <p className="text-ink-muted">No engagements yet.</p>}
      </div>
    </div>
  );
}
