import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { qk } from '@/api/queryKeys';
import { LoadingState } from '@/components/feedback/LoadingState';

const STATUS_COLOR: Record<string, string> = {
  planning: 'bg-yellow-50 text-yellow-700',
  active: 'bg-blue-50 text-blue-700',
  on_hold: 'bg-gray-100 text-gray-600',
  completed: 'bg-green-50 text-brand-green',
  cancelled: 'bg-red-50 text-brand-red',
};

export default function ProjectList() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: qk.projects({ status }),
    queryFn: () =>
      api
        .get('/projects', { params: { limit: 100, ...(status ? { status } : {}) } })
        .then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  const projects: {
    id: string;
    project_no: string;
    name: string;
    status: string;
    progress_pct: number;
    contract_value?: { amount: string; currency: string };
    start_planned?: string;
    end_planned?: string;
  }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Projects</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {['', 'planning', 'active', 'on_hold', 'completed'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${status === s ? 'bg-brand-green text-white' : 'bg-surface-alt text-ink-muted'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/console/projects/${p.id}`}
            className="block rounded-lg border border-line bg-white p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold">{p.name ?? p.project_no}</p>
                <p className="text-xs text-ink-muted">{p.project_no}</p>
              </div>
              <div className="flex items-center gap-3">
                {p.contract_value && (
                  <span className="font-medium text-sm">
                    {p.contract_value.currency} {Number(p.contract_value.amount).toLocaleString()}
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLOR[p.status] ?? 'bg-gray-100'}`}
                >
                  {p.status}
                </span>
              </div>
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
        ))}
        {projects.length === 0 && <p className="text-ink-muted">No projects found.</p>}
      </div>
    </div>
  );
}
