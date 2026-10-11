import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function ProjectTimeline() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`).then((r) => r.data),
    enabled: !!id,
  });
  const { data: milestones } = useQuery({
    queryKey: ['project-milestones', id],
    queryFn: () => api.get(`/projects/${id}/milestones`).then((r) => r.data.data ?? []),
    enabled: !!id,
  });

  if (isLoading) return <LoadingState />;
  if (!project) return <p className="p-8 text-ink-muted">Project not found.</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-green">{project.name ?? project.project_no}</h1>
      <p className="text-sm text-ink-muted capitalize">Status: {project.status}</p>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-ink-muted mb-1">
          <span>Overall progress</span>
          <span>{project.progress_pct ?? 0}%</span>
        </div>
        <div className="h-3 rounded-full bg-surface-alt">
          <div
            className="h-3 rounded-full bg-brand-green transition-all"
            style={{ width: `${project.progress_pct ?? 0}%` }}
          />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-bold">Milestones</h2>
        <div className="mt-4 space-y-3">
          {(milestones ?? []).map(
            (m: { id: string; seq: number; name: string; due_date?: string; status: string }) => (
              <div key={m.id} className="flex items-center gap-4 rounded-lg border border-line bg-white p-4">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${m.status === 'done' ? 'bg-brand-green text-white' : 'bg-surface-alt text-ink-muted'}`}
                >
                  {m.status === 'done' ? '✓' : m.seq}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{m.name}</p>
                  {m.due_date && (
                    <p className="text-xs text-ink-muted">Due {new Date(m.due_date).toLocaleDateString()}</p>
                  )}
                </div>
                <span className="text-xs capitalize text-ink-muted">{m.status}</span>
              </div>
            ),
          )}
          {(milestones ?? []).length === 0 && <p className="text-sm text-ink-muted">No milestones yet.</p>}
        </div>
      </div>

      {project.contract_value && (
        <div className="mt-6 rounded-lg border border-line bg-white p-4 text-sm">
          <p>
            Contract value:{' '}
            <strong>
              {project.contract_value.currency} {Number(project.contract_value.amount).toLocaleString()}
            </strong>
          </p>
          {project.manager_id && <p className="mt-1 text-ink-muted">Project manager assigned</p>}
        </div>
      )}
    </div>
  );
}
