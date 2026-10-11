import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function Templates() {
  const { data, isLoading } = useQuery({
    queryKey: ['doc-templates'],
    queryFn: () => api.get('/documents/templates').then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingState />;
  const templates: { id: string; code: string; name: string; kind: string }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Document templates</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Templates are edited server-side. Contact your administrator to modify template content.
      </p>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Code</th>
              <th className="px-4 py-2 text-left">Kind</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 font-medium">{t.name}</td>
                <td className="px-4 py-2 font-mono text-xs text-ink-muted">{t.code}</td>
                <td className="px-4 py-2 capitalize text-ink-muted">{t.kind}</td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-ink-muted">
                  No templates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
