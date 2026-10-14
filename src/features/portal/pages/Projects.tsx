import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import '../portal.css';

const STATUS_CLASS: Record<string, string> = {
  active: 'pt-status pt-status-green',
  completed: 'pt-status pt-status-green',
  on_hold: 'pt-status pt-status-amber',
  cancelled: 'pt-status pt-status-red',
};

export default function Projects() {
  const { data, isLoading } = useQuery({
    queryKey: ['portal-projects-all'],
    queryFn: () => api.get('/projects?limit=50').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  const projects: {
    id: string;
    project_no: string;
    name: string;
    status: string;
    progress_pct: number;
    start_planned?: string;
    end_planned?: string;
  }[] = data ?? [];

  return (
    <div className="pt-doc">
      <div
        className="pt-page-head"
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: 0,
          minHeight: 72,
        }}
      >
        <img
          src="/brand/TCOIN LOGO OFFICIAL.svg"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            right: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            height: '160%',
            width: 'auto',
            opacity: 0.07,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
        <div
          style={{
            width: 72,
            height: 72,
            flexShrink: 0,
            background: '#f1f4f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ba19d',
            fontSize: 28,
          }}
        >
          ⚙
        </div>
        <div style={{ padding: '14px 22px 12px 0' }}>
          <h1>My Projects</h1>
          <p>Solar installation projects and their current progress.</p>
        </div>
      </div>

      {isLoading && (
        <div style={{ padding: 32 }}>
          <LoadingState />
        </div>
      )}

      {!isLoading && projects.length === 0 && (
        <div className="pt-empty">
          <span className="pt-empty-icon">⚙</span>
          <p>No projects yet</p>
          <span>Your installation projects will appear here once confirmed.</span>
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <>
          <div
            className="pt-row pt-row-head"
            style={{ gridTemplateColumns: '130px 1fr 120px 120px 180px 80px' }}
          >
            <span>Project No.</span>
            <span>Name</span>
            <span>Start</span>
            <span>End</span>
            <span>Progress</span>
            <span style={{ justifyContent: 'center' }}>Status</span>
          </div>

          {projects.map((p) => {
            const pct = p.progress_pct ?? 0;
            const done = pct === 100;
            return (
              <div
                key={p.id}
                className="pt-row"
                style={{ gridTemplateColumns: '130px 1fr 120px 120px 180px 80px' }}
              >
                <span style={{ fontWeight: 700, fontSize: 12, color: '#1d2f25' }}>{p.project_no}</span>
                <span>
                  <Link
                    to={`/portal/projects/${p.id}`}
                    style={{ fontWeight: 600, fontSize: 12, color: '#14723a', textDecoration: 'none' }}
                  >
                    {p.name ?? p.project_no}
                  </Link>
                </span>
                <span style={{ fontSize: 11, color: '#69736d' }}>
                  {p.start_planned
                    ? new Date(p.start_planned).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
                <span style={{ fontSize: 11, color: '#69736d' }}>
                  {p.end_planned
                    ? new Date(p.end_planned).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
                <span style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4, padding: '9px 8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 9,
                        color: '#69736d',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Progress
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: done ? '#14723a' : '#3c4540' }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="pt-progress-track">
                    <div
                      className={done ? 'pt-progress-fill pt-progress-fill-done' : 'pt-progress-fill'}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </span>
                <span style={{ justifyContent: 'center' }}>
                  <span className={STATUS_CLASS[p.status] ?? 'pt-status pt-status-grey'}>
                    {p.status?.replace(/_/g, ' ')}
                  </span>
                </span>
              </div>
            );
          })}

          <div className="pt-doc-footer">
            <span>
              {projects.length} project{projects.length !== 1 ? 's' : ''} on record
            </span>
          </div>
        </>
      )}
    </div>
  );
}
