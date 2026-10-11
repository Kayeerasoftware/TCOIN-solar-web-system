import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function Warranties() {
  const { data: assets, isLoading } = useQuery({
    queryKey: ['portal-assets-w'],
    queryFn: () => api.get('/assets?limit=50').then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Warranties</h1>
      <p className="mt-1 text-sm text-ink-muted">Warranty status for your installed equipment.</p>
      {(assets ?? []).length === 0 && <p className="mt-6 text-ink-muted">No assets on record.</p>}
      <div className="mt-6 space-y-4">
        {(assets ?? []).map((a: { id: string; asset_no: string; name: string }) => (
          <AssetWarranties key={a.id} assetId={a.id} assetName={a.name ?? a.asset_no} />
        ))}
      </div>
    </div>
  );
}

function AssetWarranties({ assetId, assetName }: { assetId: string; assetName: string }) {
  const { data } = useQuery({
    queryKey: ['warranties', assetId],
    queryFn: () => api.get(`/assets/${assetId}/warranties`).then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <p className="font-bold">{assetName}</p>
      {(data ?? []).length === 0 && <p className="mt-2 text-sm text-ink-muted">No warranties on record.</p>}
      {(data ?? []).map(
        (w: {
          id: string;
          coverage_type: string;
          starts_on: string;
          ends_on: string;
          effective_status: string;
          days_remaining: number;
        }) => (
          <div
            key={w.id}
            className="mt-2 flex items-center justify-between text-sm border-t border-line pt-2"
          >
            <div>
              <p className="font-medium capitalize">{w.coverage_type?.replace(/_/g, ' ')}</p>
              <p className="text-xs text-ink-muted">
                {w.starts_on} → {w.ends_on}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${w.effective_status === 'active' ? 'bg-green-50 text-brand-green' : 'bg-red-50 text-brand-red'}`}
            >
              {w.effective_status === 'active' ? `${w.days_remaining}d left` : w.effective_status}
            </span>
          </div>
        ),
      )}
    </div>
  );
}
