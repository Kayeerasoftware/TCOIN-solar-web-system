import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function ServiceContracts() {
  const { data, isLoading } = useQuery({
    queryKey: ['service-contracts'],
    queryFn: () => api.get('/service-contracts?limit=100').then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingState />;

  const contracts: {
    id: string;
    contract_no: string;
    plan_name: string;
    status?: string;
    currency: string;
    starts_on?: string;
    ends_on?: string;
  }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Service contracts</h1>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Contract #</th>
              <th className="px-4 py-2 text-left">Plan</th>
              <th className="px-4 py-2 text-left">Start</th>
              <th className="px-4 py-2 text-left">End</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 font-medium">{c.contract_no}</td>
                <td className="px-4 py-2">{c.plan_name}</td>
                <td className="px-4 py-2 text-ink-muted">{c.starts_on ?? '—'}</td>
                <td className="px-4 py-2 text-ink-muted">{c.ends_on ?? '—'}</td>
                <td className="px-4 py-2 capitalize">{c.status ?? 'active'}</td>
              </tr>
            ))}
            {contracts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  No contracts.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
