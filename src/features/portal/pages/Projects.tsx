import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function Projects() {
  const { data, isLoading } = useQuery({
    queryKey: ['portal-projects-all'],
    queryFn: () => api.get('/projects?limit=50').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">My projects</h1>
      {(data ?? []).length === 0 && <p className="mt-6 text-ink-muted">No projects yet.</p>}
      <div className="mt-6 space-y-3">
        {(data ?? []).map(
          (p: {
            id: string;
            project_no: string;
            name: string;
            status: string;
            progress_pct: number;
            start_planned?: string;
            end_planned?: string;
          }) => (
            <Link
              key={p.id}
              to={`/portal/projects/${p.id}`}
              className="block rounded-lg border border-line bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">{p.name ?? p.project_no}</p>
                  <p className="text-xs text-ink-muted">{p.project_no}</p>
                </div>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-brand-green capitalize">
                  {p.status}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-ink-muted mb-1">
                  <span>Progress</span>
                  <span>{p.progress_pct ?? 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-alt">
                  <div
                    className="h-2 rounded-full bg-brand-green"
                    style={{ width: `${p.progress_pct ?? 0}%` }}
                  />
                </div>
              </div>
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
