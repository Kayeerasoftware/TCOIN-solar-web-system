import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function CrewSchedule() {
  const today = new Date().toISOString().slice(0, 10);
  const end = new Date(Date.now() + 14 * 86400_000).toISOString().slice(0, 10);

  const { data, isLoading } = useQuery({
    queryKey: ['schedule', today, end],
    queryFn: () => api.get('/schedule', { params: { from: today, to: end } }).then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingState />;

  const assignments: {
    id: string;
    project_id: string;
    crew_id: string;
    starts_at: string;
    ends_at: string;
  }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Crew schedule</h1>
      <p className="mt-1 text-sm text-ink-muted">Next 14 days</p>
      {assignments.length === 0 && <p className="mt-6 text-ink-muted">No assignments in this period.</p>}
      <div className="mt-6 space-y-3">
        {assignments.map((a) => (
          <div key={a.id} className="rounded-lg border border-line bg-white p-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">Project {a.project_id}</p>
              <p className="text-ink-muted">Crew {a.crew_id}</p>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              {new Date(a.starts_at).toLocaleString()} → {new Date(a.ends_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
