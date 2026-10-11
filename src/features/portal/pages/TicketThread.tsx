import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/feedback/LoadingState';

const STATUS_TONE: Record<string, 'green' | 'amber' | 'red' | 'grey'> = {
  open: 'amber',
  responded: 'green',
  resolving: 'green',
  resolved: 'green',
  closed: 'grey',
};

export default function TicketThread() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [reply, setReply] = useState('');
  const [sent, setSent] = useState(false);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.get(`/tickets/${id}`).then((r) => r.data),
    enabled: !!id,
    refetchInterval: 30_000,
  });

  const sendReply = useMutation({
    mutationFn: () => api.post(`/tickets/${id}/replies`, { message: reply }),
    onSuccess: () => {
      setReply('');
      setSent(true);
      qc.invalidateQueries({ queryKey: ['ticket', id] });
    },
  });

  if (isLoading) return <LoadingState />;
  if (!ticket)
    return (
      <p className="p-8 text-ink-muted">
        Ticket not found.{' '}
        <Link to="/portal/support/new" className="text-brand-green underline">
          Raise a new ticket
        </Link>
      </p>
    );

  const canReply = ticket.status !== 'closed';

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
          <p className="mt-0.5 text-xs text-ink-muted">
            {ticket.ticket_no} · {ticket.category} · Priority:{' '}
            <span className="capitalize">{ticket.priority}</span>
          </p>
        </div>
        <Badge tone={STATUS_TONE[ticket.status] ?? 'grey'}>{ticket.status}</Badge>
      </div>

      {/* Original description */}
      {ticket.description && (
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="mb-1 text-xs font-medium text-ink-muted uppercase tracking-wide">Your message</p>
          <p className="text-sm text-ink">{ticket.description}</p>
        </div>
      )}

      {/* SLA info */}
      {(ticket.sla_response_due || ticket.sla_resolution_due) && (
        <div className="grid grid-cols-2 gap-3">
          {ticket.sla_response_due && (
            <div className="rounded border border-line bg-white p-3">
              <p className="text-xs text-ink-muted">Response due</p>
              <p className="mt-0.5 text-sm font-medium">
                {new Date(ticket.sla_response_due).toLocaleString()}
              </p>
            </div>
          )}
          {ticket.sla_resolution_due && (
            <div className="rounded border border-line bg-white p-3">
              <p className="text-xs text-ink-muted">Resolution due</p>
              <p className="mt-0.5 text-sm font-medium">
                {new Date(ticket.sla_resolution_due).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reply box */}
      {canReply && (
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="mb-2 text-sm font-medium">Add a reply</p>
          {sent && (
            <p className="mb-2 rounded bg-green-50 px-3 py-2 text-sm text-brand-green">
              Reply sent. Our team will respond shortly.
            </p>
          )}
          <textarea
            className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-green"
            rows={4}
            placeholder="Describe any updates or additional information…"
            value={reply}
            onChange={(e) => {
              setReply(e.target.value);
              setSent(false);
            }}
          />
          <div className="mt-2 flex justify-end">
            <Button onClick={() => sendReply.mutate()} busy={sendReply.isPending} disabled={!reply.trim()}>
              Send reply
            </Button>
          </div>
        </div>
      )}

      {ticket.status === 'closed' && (
        <div className="rounded-lg border border-line bg-surface-alt p-4 text-sm text-ink-muted">
          This ticket is closed.{' '}
          <Link to="/portal/support/new" className="text-brand-green underline">
            Open a new ticket
          </Link>{' '}
          if you need further assistance.
        </div>
      )}

      <p className="text-xs text-ink-muted">For urgent issues call our hotline directly.</p>
    </div>
  );
}
