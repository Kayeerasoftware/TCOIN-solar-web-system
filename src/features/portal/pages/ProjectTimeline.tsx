import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import '../portal.css';

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

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

  if (isLoading)
    return (
      <div className="pt-doc" style={{ padding: 32 }}>
        <LoadingState />
      </div>
    );
  if (!project)
    return (
      <div className="pt-doc">
        <div className="pt-empty">
          <p>Project not found.</p>
        </div>
      </div>
    );

  const pct = project.progress_pct ?? 0;
  const done = pct === 100;
  const ms: { id: string; seq: number; name: string; due_date?: string; status: string }[] = milestones ?? [];

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
        <div style={{ padding: '14px 22px 12px 0', flex: 1 }}>
          <h1>{project.name ?? project.project_no}</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ textTransform: 'capitalize' }}>{project.status?.replace(/_/g, ' ')}</span>
            <span style={{ color: '#9ba19d' }}>·</span>
            <span>{pct}% complete</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '12px 22px', borderBottom: '1px solid #9ba19d' }}>
        <div className="pt-progress-track">
          <div
            className={done ? 'pt-progress-fill pt-progress-fill-done' : 'pt-progress-fill'}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Milestones */}
      <div className="pt-section">
        <div className="pt-section-head">
          <h2>Milestones</h2>
        </div>
        {ms.length === 0 && (
          <div className="pt-empty" style={{ padding: '24px 0' }}>
            <span>No milestones yet.</span>
          </div>
        )}
        {ms.length > 0 && (
          <>
            <div className="pt-row pt-row-head" style={{ gridTemplateColumns: '44px 1fr 140px 80px' }}>
              <span style={{ justifyContent: 'center' }}>#</span>
              <span>Milestone</span>
              <span>Due date</span>
              <span style={{ justifyContent: 'center' }}>Status</span>
            </div>
            {ms.map((m) => (
              <div key={m.id} className="pt-row" style={{ gridTemplateColumns: '44px 1fr 140px 80px' }}>
                <span style={{ justifyContent: 'center' }}>
                  <span
                    style={{
                      display: 'grid',
                      placeItems: 'center',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: m.status === 'done' ? '#14723a' : '#e0e5e2',
                      color: m.status === 'done' ? '#fff' : '#69736d',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {m.status === 'done' ? '✓' : m.seq}
                  </span>
                </span>
                <span style={{ fontWeight: 600, fontSize: 12, color: '#1d2f25' }}>{m.name}</span>
                <span style={{ fontSize: 11, color: '#69736d' }}>
                  {m.due_date
                    ? new Date(m.due_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
                <span style={{ justifyContent: 'center' }}>
                  <span
                    className={
                      m.status === 'done' ? 'pt-status pt-status-green' : 'pt-status pt-status-amber'
                    }
                    style={{ textTransform: 'capitalize' }}
                  >
                    {m.status}
                  </span>
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      {project.contract_value && (
        <div className="pt-section">
          <div className="pt-section-head">
            <h2>Contract</h2>
          </div>
          <div className="pt-section-body" style={{ padding: '12px 22px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #f1f4f1',
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  color: '#69736d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 800,
                }}
              >
                Contract value
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#1d2f25', fontFamily: 'Georgia, serif' }}>
                {project.contract_value.currency} {fmt(project.contract_value.amount)}
              </span>
            </div>
            {project.manager_id && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    color: '#69736d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 800,
                  }}
                >
                  Project manager
                </span>
                <span style={{ fontSize: 13, color: '#3c4540' }}>Assigned</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pt-doc-footer">
        <span>TCOIN Solar UG · Customer Portal</span>
        <span>All figures are indicative pending confirmation.</span>
      </div>
    </div>
  );
}
