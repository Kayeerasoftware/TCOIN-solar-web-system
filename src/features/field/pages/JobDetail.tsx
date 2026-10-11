import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useQuery({
    queryKey: ['field-project', id],
    queryFn: () => api.get(`/projects/${id}`).then((r) => r.data),
    enabled: !!id,
  });
  const { data: tasks } = useQuery({
    queryKey: ['field-tasks', id],
    queryFn: () => api.get(`/projects/${id}/tasks`).then((r) => r.data.data ?? []),
    enabled: !!id,
  });

  if (isLoading) return <LoadingState />;
  if (!project) return <p className="p-4 text-ink-muted">Job not found.</p>;

  const steps = [
    { label: 'Checklist', to: `/field/jobs/${id}/checklist` },
    { label: 'Parts & serials', to: `/field/jobs/${id}/parts` },
    { label: 'Commissioning', to: `/field/jobs/${id}/commissioning` },
    { label: 'Sign-off', to: `/field/jobs/${id}/sign-off` },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">{project.name ?? project.project_no}</h1>
        <p className="text-sm text-ink-muted capitalize">{project.status}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {steps.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="rounded-lg border border-line bg-white p-4 text-center font-medium hover:bg-green-50 hover:border-brand-green transition-colors"
          >
            {s.label}
          </Link>
        ))}
      </div>

      {(tasks ?? []).length > 0 && (
        <div>
          <h2 className="font-bold text-sm mt-4">Tasks</h2>
          <div className="mt-2 space-y-2">
            {(tasks ?? []).map((t: { id: string; title: string; status: string }) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded border border-line bg-white px-3 py-2 text-sm"
              >
                <span>{t.title}</span>
                <span className="text-xs capitalize text-ink-muted">{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
