import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const STATUS_BADGE: Record<string, 'green' | 'amber' | 'red' | 'grey'> = {
  sent: 'amber',
  accepted: 'green',
  draft: 'grey',
  expired: 'red',
  active: 'green',
  completed: 'green',
  on_hold: 'amber',
  paid: 'green',
  partial: 'amber',
  unpaid: 'red',
  open: 'amber',
  responded: 'green',
  closed: 'grey',
};

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
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
    {
      label: 'Quotes awaiting review',
      value: openQuotes,
      to: '/portal/quotes',
      icon: '📋',
      color: 'border-l-brand-indigo',
    },
    {
      label: 'Active projects',
      value: activeProjects,
      to: '/portal/projects',
      icon: '🔧',
      color: 'border-l-brand-green',
    },
    {
      label: 'Unpaid invoices',
      value: unpaidInvoices,
      to: '/portal/billing',
      icon: '💳',
      color: 'border-l-amber-500',
    },
    {
      label: 'Open support tickets',
      value: openTickets,
      to: '/portal/support/new',
      icon: '🎫',
      color: 'border-l-brand-red',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-green">Welcome back, {user?.full_name.split(' ')[0]}</h1>
        <p className="text-sm text-ink-muted">Here's what's happening with your solar account.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className={`flex items-center gap-4 rounded-lg border border-line border-l-4 ${s.color} bg-white p-4 hover:shadow-md transition-shadow`}
          >
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold text-ink">{s.value}</p>
              <p className="text-xs text-ink-muted leading-tight">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent quotes */}
        <Card title="Recent quotes">
          {(
            quotes as {
              id: string;
              quote_no: string;
              status: string;
              version?: { total?: { amount: string; currency: string } };
            }[]
          ).length === 0 ? (
            <p className="text-sm text-ink-muted">No quotes yet.</p>
          ) : (
            (
              quotes as {
                id: string;
                quote_no: string;
                status: string;
                version?: { total?: { amount: string; currency: string } };
              }[]
            )
              .slice(0, 4)
              .map((q) => (
                <Link
                  key={q.id}
                  to={`/portal/quotes/${q.id}`}
                  className="flex items-center justify-between border-b border-line py-2.5 last:border-0 hover:text-brand-green"
                >
                  <span className="text-sm font-medium">{q.quote_no}</span>
                  <div className="flex items-center gap-3">
                    {q.version?.total && (
                      <span className="text-xs text-ink-muted">
                        {q.version.total.currency} {fmt(q.version.total.amount)}
                      </span>
                    )}
                    <Badge tone={STATUS_BADGE[q.status] ?? 'grey'}>{q.status}</Badge>
                  </div>
                </Link>
              ))
          )}
          <Link
            to="/portal/quotes"
            className="mt-3 block text-xs font-medium text-brand-green hover:underline"
          >
            View all quotes →
          </Link>
        </Card>

        {/* Active projects */}
        <Card title="Active projects">
          {(
            projects as {
              id: string;
              project_no: string;
              name: string;
              status: string;
              progress_pct: number;
            }[]
          ).filter((p) => p.status === 'active').length === 0 ? (
            <p className="text-sm text-ink-muted">No active projects.</p>
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
                <Link
                  key={p.id}
                  to={`/portal/projects/${p.id}`}
                  className="block border-b border-line py-2.5 last:border-0 hover:text-brand-green"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{p.name ?? p.project_no}</span>
                    <span className="text-xs text-ink-muted">{p.progress_pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-surface-alt">
                    <div
                      className="h-1.5 rounded-full bg-brand-green transition-all"
                      style={{ width: `${p.progress_pct}%` }}
                    />
                  </div>
                </Link>
              ))
          )}
          <Link
            to="/portal/projects"
            className="mt-3 block text-xs font-medium text-brand-green hover:underline"
          >
            View all projects →
          </Link>
        </Card>

        {/* Recent invoices */}
        <Card title="Recent invoices">
          {(
            invoices as {
              id: string;
              invoice_no: string;
              payment_state: string;
              total: { amount: string; currency: string };
            }[]
          ).length === 0 ? (
            <p className="text-sm text-ink-muted">No invoices yet.</p>
          ) : (
            (
              invoices as {
                id: string;
                invoice_no: string;
                payment_state: string;
                total: { amount: string; currency: string };
              }[]
            )
              .slice(0, 4)
              .map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between border-b border-line py-2.5 last:border-0"
                >
                  <span className="text-sm font-medium">{inv.invoice_no}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-muted">
                      {inv.total?.currency} {fmt(inv.total?.amount ?? 0)}
                    </span>
                    <Badge tone={STATUS_BADGE[inv.payment_state] ?? 'grey'}>{inv.payment_state}</Badge>
                  </div>
                </div>
              ))
          )}
          <Link
            to="/portal/billing"
            className="mt-3 block text-xs font-medium text-brand-green hover:underline"
          >
            View all invoices →
          </Link>
        </Card>

        {/* Quick actions */}
        <Card title="Quick actions">
          <div className="space-y-2">
            {[
              { label: '🎫  Raise a support ticket', to: '/portal/support/new' },
              { label: '🔋  View my systems', to: '/portal/systems' },
              { label: '🛡️  Check warranties', to: '/portal/warranties' },
              { label: '🛒  Browse the store', to: '/store' },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center justify-between rounded-md border border-line px-3 py-2.5 text-sm hover:bg-green-50 hover:text-brand-green transition-colors"
              >
                {a.label}
                <span className="text-ink-muted">→</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
