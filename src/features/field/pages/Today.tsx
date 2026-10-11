import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function Today() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ['field-tasks'],
    queryFn: () => api.get(`/projects?limit=50&manager_id=${user?.id ?? ''}`).then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingState />;

  const jobs: { id: string; project_no: string; name: string; status: string }[] = data ?? [];

  return (
    <div>
      <h1 className="text-xl font-bold">Today's jobs</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {new Date().toLocaleDateString('en-UG', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
      {jobs.length === 0 && <p className="mt-8 text-center text-ink-muted">No jobs assigned for today.</p>}
      <div className="mt-4 space-y-3">
        {jobs.map((j) => (
          <Link
            key={j.id}
            to={`/field/jobs/${j.id}`}
            className="block rounded-lg border border-line bg-white p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">{j.name ?? j.project_no}</p>
                <p className="text-xs text-ink-muted">{j.project_no}</p>
              </div>
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-brand-green capitalize">
                {j.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
