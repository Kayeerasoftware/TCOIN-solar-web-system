import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { AVATARS } from '@/app/layouts/PortalLayout';
import '../portal.css';

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

type StatusKey =
  | 'sent'
  | 'accepted'
  | 'draft'
  | 'expired'
  | 'active'
  | 'completed'
  | 'paid'
  | 'partial'
  | 'unpaid'
  | 'open'
  | 'closed'
  | 'on_hold';

const STATUS_CLASS: Record<string, string> = {
  sent: 'pt-status pt-status-amber',
  accepted: 'pt-status pt-status-green',
  active: 'pt-status pt-status-green',
  completed: 'pt-status pt-status-green',
  paid: 'pt-status pt-status-green',
  draft: 'pt-status pt-status-grey',
  expired: 'pt-status pt-status-red',
  unpaid: 'pt-status pt-status-red',
  partial: 'pt-status pt-status-amber',
  open: 'pt-status pt-status-amber',
  on_hold: 'pt-status pt-status-amber',
  closed: 'pt-status pt-status-grey',
};

function Status({ s }: { s: string }) {
  return <span className={STATUS_CLASS[s] ?? 'pt-status pt-status-grey'}>{s.replace(/_/g, ' ')}</span>;
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const avatar = user ? (user.avatar ?? AVATARS[user.id] ?? null) : null;
  const initials =
    user?.full_name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('') ?? '?';

  const { data: quotes = [] } = useQuery({
    queryKey: ['portal-quotes'],
    queryFn: () => api.get('/quotes?limit=50').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });
  const { data: projects = [] } = useQuery({
    queryKey: ['portal-projects'],
    queryFn: () => api.get('/projects?limit=50').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ['portal-invoices'],
    queryFn: () => api.get('/invoices?limit=50').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });
  const { data: tickets = [] } = useQuery({
    queryKey: ['portal-tickets'],
    queryFn: () => api.get('/tickets?limit=50').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  const openQuotes = (quotes as { status: string }[]).filter((q) => q.status === 'sent').length;
  const activeProjects = (projects as { status: string }[]).filter((p) => p.status === 'active').length;
  const unpaidInvoices = (invoices as { payment_state: string }[]).filter(
    (i) => i.payment_state !== 'paid',
  ).length;
  const openTickets = (tickets as { status: string }[]).filter((t) => t.status !== 'closed').length;

  const stats = [
    { label: 'Quotes awaiting review', value: openQuotes, to: '/portal/quotes', icon: '📋' },
    { label: 'Active projects', value: activeProjects, to: '/portal/projects', icon: '⚙' },
    { label: 'Unpaid invoices', value: unpaidInvoices, to: '/portal/billing', icon: '₤' },
    { label: 'Open support tickets', value: openTickets, to: '/portal/support/new', icon: '✉' },
  ];

  return (
    <div className="pt-doc">
      {/* Page header — logo watermark same as Home hero */}
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
            overflow: 'hidden',
            background: avatar ? undefined : 'linear-gradient(135deg,#1D6434,#155228)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontWeight: 800,
            color: '#fff',
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={user?.full_name ?? ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
            />
          ) : (
            initials
          )}
        </div>
        <div style={{ padding: '14px 22px 12px 0' }}>
          <h1>Account Overview</h1>
          <p>Welcome back, {user?.full_name} — here is your solar account at a glance.</p>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="pt-stats-grid">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="pt-stat-tile">
            <span className="pt-stat-icon">{s.icon}</span>
            <div>
              <div className="pt-stat-value">{s.value}</div>
              <div className="pt-stat-label">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column lower sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #9ba19d' }}>
        {/* Recent quotes */}
        <div style={{ borderRight: '1px solid #9ba19d' }}>
          <div
            className="pt-section-head"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <h2>Recent Quotes</h2>
            <Link to="/portal/quotes" className="pt-link">
              View all →
            </Link>
          </div>
          <div className="pt-section-body">
            {(
              quotes as {
                id: string;
                quote_no: string;
                status: StatusKey;
                version?: { total?: { amount: string } };
              }[]
            ).length === 0 ? (
              <div className="pt-empty" style={{ padding: '24px 0' }}>
                <span>No quotes yet.</span>
              </div>
            ) : (
              (
                quotes as {
                  id: string;
                  quote_no: string;
                  status: StatusKey;
                  version?: { total?: { amount: string } };
                }[]
              )
                .slice(0, 5)
                .map((q) => (
                  <div key={q.id} className="pt-row" style={{ gridTemplateColumns: '1fr auto auto' }}>
                    <Link
                      to={`/portal/quotes/${q.id}`}
                      style={{
                        fontWeight: 700,
                        fontSize: 12,
                        color: '#1d2f25',
                        textDecoration: 'none',
                        padding: '9px 8px',
                      }}
                    >
                      {q.quote_no}
                    </Link>
                    <span
                      style={{
                        padding: '9px 8px',
                        fontSize: 11,
                        color: '#69736d',
                        borderRight: '1px solid #e0e5e2',
                      }}
                    >
                      {q.version?.total ? `UGX ${fmt(q.version.total.amount)}` : '—'}
                    </span>
                    <span style={{ padding: '9px 8px' }}>
                      <Status s={q.status} />
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Active projects */}
        <div>
          <div
            className="pt-section-head"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <h2>Active Projects</h2>
            <Link to="/portal/projects" className="pt-link">
              View all →
            </Link>
          </div>
          <div className="pt-section-body">
            {(
              projects as {
                id: string;
                project_no: string;
                name: string;
                status: string;
                progress_pct: number;
              }[]
            ).filter((p) => p.status === 'active').length === 0 ? (
              <div className="pt-empty" style={{ padding: '24px 0' }}>
                <span>No active projects.</span>
              </div>
            ) : (
              (
                projects as {
                  id: string;
                  project_no: string;
                  name: string;
                  status: string;
                  progress_pct: number;
                }[]
              )
                .filter((p) => p.status === 'active')
                .map((p) => (
                  <div
                    key={p.id}
                    className="pt-row"
                    style={{ gridTemplateColumns: '1fr 60px', display: 'block', padding: '9px 8px' }}
                  >
                    <Link
                      to={`/portal/projects/${p.id}`}
                      style={{
                        display: 'block',
                        fontWeight: 700,
                        fontSize: 12,
                        color: '#1d2f25',
                        textDecoration: 'none',
                        marginBottom: 6,
                      }}
                    >
                      {p.name ?? p.project_no}
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="pt-progress-track" style={{ flex: 1 }}>
                        <div className="pt-progress-fill" style={{ width: `${p.progress_pct}%` }} />
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          color: '#69736d',
                          flexShrink: 0,
                          width: 30,
                          textAlign: 'right',
                        }}
                      >
                        {p.progress_pct}%
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Recent invoices + Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* Recent invoices */}
        <div style={{ borderRight: '1px solid #9ba19d' }}>
          <div
            className="pt-section-head"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <h2>Recent Invoices</h2>
            <Link to="/portal/billing" className="pt-link">
              View all →
            </Link>
          </div>
          <div className="pt-section-body">
            {(
              invoices as {
                id: string;
                invoice_no: string;
                payment_state: string;
                total: { amount: string };
              }[]
            ).length === 0 ? (
              <div className="pt-empty" style={{ padding: '24px 0' }}>
                <span>No invoices yet.</span>
              </div>
            ) : (
              (
                invoices as {
                  id: string;
                  invoice_no: string;
                  payment_state: string;
                  total: { amount: string };
                }[]
              )
                .slice(0, 4)
                .map((inv) => (
                  <div key={inv.id} className="pt-row" style={{ gridTemplateColumns: '1fr auto auto' }}>
                    <span style={{ padding: '9px 8px', fontWeight: 700, fontSize: 12, color: '#1d2f25' }}>
                      {inv.invoice_no}
                    </span>
                    <span
                      style={{
                        padding: '9px 8px',
                        fontSize: 11,
                        color: '#69736d',
                        borderRight: '1px solid #e0e5e2',
                      }}
                    >
                      UGX {fmt(inv.total?.amount ?? 0)}
                    </span>
                    <span style={{ padding: '9px 8px' }}>
                      <Status s={inv.payment_state} />
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <div className="pt-section-head">
            <h2>Quick Actions</h2>
          </div>
          <div className="pt-section-body">
            {[
              { label: 'Raise a support ticket', to: '/portal/support/new', icon: '✉' },
              { label: 'View my systems', to: '/portal/systems', icon: '⚡' },
              { label: 'Check warranties', to: '/portal/warranties', icon: '🛡' },
              { label: 'Browse the store', to: '/store', icon: '→' },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 8px',
                  borderBottom: '1px solid #e0e5e2',
                  textDecoration: 'none',
                  color: '#3c4540',
                  fontSize: 12,
                  transition: 'background 100ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f4f1')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                <span style={{ width: 18, textAlign: 'center', fontSize: 13 }}>{a.icon}</span>
                {a.label}
                <span style={{ marginLeft: 'auto', color: '#9ba19d', fontSize: 14 }}>›</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-doc-footer">
        <span>TCOIN Solar UG · Customer Portal</span>
        <span>All figures are indicative pending confirmation.</span>
      </div>
    </div>
  );
}
