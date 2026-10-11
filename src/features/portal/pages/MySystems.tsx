import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function MySystems() {
  const { data: assets, isLoading } = useQuery({
    queryKey: ['portal-assets'],
    queryFn: () => api.get('/assets?limit=50').then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">My systems</h1>
      {(assets ?? []).length === 0 && (
        <p className="mt-6 text-ink-muted">No installed systems on record yet.</p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(assets ?? []).map(
          (a: {
            id: string;
            asset_no: string;
            name: string;
            asset_type: string;
            serial_no?: string;
            installed_at?: string;
            status: string;
          }) => (
            <div key={a.id} className="rounded-lg border border-line bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">{a.name ?? a.asset_no}</p>
                  <p className="text-xs text-ink-muted capitalize">{a.asset_type?.replace(/_/g, ' ')}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.status === 'active' ? 'bg-green-50 text-brand-green' : 'bg-gray-100 text-gray-600'}`}
                >
                  {a.status}
                </span>
              </div>
              {a.serial_no && <p className="mt-2 text-xs text-ink-muted">S/N: {a.serial_no}</p>}
              {a.installed_at && (
                <p className="text-xs text-ink-muted">
                  Installed: {new Date(a.installed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
