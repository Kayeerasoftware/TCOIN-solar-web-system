import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [newStatus, setNewStatus] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.get(`/tickets/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const update = useMutation({
    mutationFn: (status: string) => api.patch(`/tickets/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', id] });
      setNewStatus('');
    },
  });

  const createWO = useMutation({
    mutationFn: () =>
      api.post('/work-orders', {
        ticket_id: id,
        asset_id: ticket?.asset_id,
        customer_id: ticket?.customer_id,
        wo_type: 'corrective',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ticket', id] }),
  });

  if (isLoading) return <LoadingState />;
  if (!ticket) return <p className="p-8 text-ink-muted">Ticket not found.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
          <p className="text-xs text-ink-muted">
            {ticket.ticket_no} · {ticket.category} · <span className="capitalize">{ticket.priority}</span>
          </p>
        </div>
        <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium capitalize text-yellow-700">
          {ticket.status}
        </span>
      </div>

      {ticket.description && (
        <div className="rounded-lg border border-line bg-white p-4 text-sm text-ink-muted">
          {ticket.description}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        {ticket.sla_response_due && (
          <div className="rounded border border-line bg-white p-3">
            <p className="text-xs text-ink-muted">Response due</p>
            <p className="font-medium">{new Date(ticket.sla_response_due).toLocaleString()}</p>
          </div>
        )}
        {ticket.sla_resolution_due && (
          <div className="rounded border border-line bg-white p-3">
            <p className="text-xs text-ink-muted">Resolution due</p>
            <p className="font-medium">{new Date(ticket.sla_resolution_due).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <select
            className="rounded border border-line px-3 py-2 text-sm"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="">Change status…</option>
            {['responded', 'resolving', 'resolved', 'closed'].map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={() => newStatus && update.mutate(newStatus)}
            busy={update.isPending}
            disabled={!newStatus}
          >
            Update
          </Button>
        </div>
        <Button variant="secondary" onClick={() => createWO.mutate()} busy={createWO.isPending}>
          Create work order
        </Button>
      </div>
    </div>
  );
}
