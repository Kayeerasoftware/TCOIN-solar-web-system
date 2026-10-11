import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { qk } from '@/api/queryKeys';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Card } from '@/components/ui/Card';

export default function ProjectDashboard() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useQuery({
    queryKey: qk.project(id!),
    queryFn: () => api.get(`/projects/${id}`).then((r) => r.data),
    enabled: !!id,
  });
  const { data: milestones } = useQuery({
    queryKey: ['project-milestones', id],
    queryFn: () => api.get(`/projects/${id}/milestones`).then((r) => r.data.data ?? []),
    enabled: !!id,
  });
  const { data: tasks } = useQuery({
    queryKey: ['project-tasks', id],
    queryFn: () => api.get(`/projects/${id}/tasks`).then((r) => r.data.data ?? []),
    enabled: !!id,
  });

  if (isLoading) return <LoadingState />;
  if (!project) return <p className="p-8 text-ink-muted">Project not found.</p>;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name ?? project.project_no}</h1>
          <p className="text-sm text-ink-muted capitalize">
            {project.project_no} · {project.status}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/console/projects/${id}/commissioning`} className="text-sm text-brand-green underline">
            Commissioning
          </Link>
          <Link to={`/console/projects/${id}/handover`} className="text-sm text-brand-green underline ml-4">
            Handover
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Progress', value: `${project.progress_pct ?? 0}%` },
          {
            label: 'Contract value',
            value: project.contract_value
              ? `${project.contract_value.currency} ${Number(project.contract_value.amount).toLocaleString()}`
              : '—',
          },
          {
            label: 'Actual cost',
            value: project.actual_cost
              ? `${project.actual_cost.currency} ${Number(project.actual_cost.amount).toLocaleString()}`
              : '—',
          },
          { label: 'Margin', value: project.margin_pct !== undefined ? `${project.margin_pct}%` : '—' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-line bg-white p-4">
            <p className="text-xs text-ink-muted">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-brand-green">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card title="Milestones">
          {(milestones ?? []).map(
            (m: { id: string; seq: number; name: string; due_date?: string; status: string }) => (
              <div
                key={m.id}
                className="flex items-center gap-3 border-b border-line py-2 last:border-0 text-sm"
              >
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${m.status === 'done' ? 'bg-brand-green text-white' : 'bg-surface-alt text-ink-muted'}`}
                >
                  {m.status === 'done' ? '✓' : m.seq}
                </span>
                <span className="flex-1">{m.name}</span>
                {m.due_date && (
                  <span className="text-xs text-ink-muted">{new Date(m.due_date).toLocaleDateString()}</span>
                )}
              </div>
            ),
          )}
          {(milestones ?? []).length === 0 && <p className="text-sm text-ink-muted">No milestones.</p>}
        </Card>

        <Card title="Tasks">
          {(tasks ?? [])
            .slice(0, 8)
            .map((t: { id: string; title: string; status: string; due_date?: string }) => (
              <div
                key={t.id}
                className="flex items-center justify-between border-b border-line py-2 last:border-0 text-sm"
              >
                <span className={t.status === 'done' ? 'line-through text-ink-muted' : ''}>{t.title}</span>
                <span className="text-xs capitalize text-ink-muted">{t.status}</span>
              </div>
            ))}
          {(tasks ?? []).length === 0 && <p className="text-sm text-ink-muted">No tasks.</p>}
        </Card>
      </div>
    </div>
  );
}
