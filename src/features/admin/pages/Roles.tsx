import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function Roles() {
  const { data, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/me').then((r) => r.data.roles ?? []),
    staleTime: 300_000,
  });

  if (isLoading) return <LoadingState />;

  const roles: { id?: string; code: string; name: string; description?: string }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Roles &amp; permissions</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Roles are managed server-side. Contact your system administrator to add or modify roles.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <div key={r.code} className="rounded-lg border border-line bg-white p-4">
            <p className="font-bold text-brand-green">{r.name}</p>
            <p className="text-xs text-ink-muted font-mono">{r.code}</p>
            {r.description && <p className="mt-1 text-sm text-ink-muted">{r.description}</p>}
          </div>
        ))}
        {roles.length === 0 && <p className="text-ink-muted">No roles data available.</p>}
      </div>
    </div>
  );
}
