import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function Assets() {
  const { data, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => api.get('/assets?limit=100').then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingState />;

  const assets: {
    id: string;
    asset_no: string;
    name: string;
    asset_type: string;
    serial_no?: string;
    status: string;
    installed_at?: string;
  }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Assets</h1>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Asset #</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Serial</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Installed</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 font-medium">{a.asset_no}</td>
                <td className="px-4 py-2">{a.name}</td>
                <td className="px-4 py-2 capitalize text-ink-muted">{a.asset_type?.replace(/_/g, ' ')}</td>
                <td className="px-4 py-2 text-ink-muted">{a.serial_no ?? '—'}</td>
                <td className="px-4 py-2 capitalize">{a.status}</td>
                <td className="px-4 py-2 text-ink-muted">
                  {a.installed_at ? new Date(a.installed_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  No assets.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
