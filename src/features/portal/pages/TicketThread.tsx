import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import '../portal.css';

const STATUS_CLASS: Record<string, string> = {
  open: 'pt-status pt-status-amber',
  responded: 'pt-status pt-status-green',
  resolving: 'pt-status pt-status-green',
  resolved: 'pt-status pt-status-green',
  closed: 'pt-status pt-status-grey',
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

  if (isLoading)
    return (
      <div className="pt-doc" style={{ padding: 32 }}>
        <LoadingState />
      </div>
    );
  if (!ticket)
    return (
      <div className="pt-doc">
        <div className="pt-empty">
          <p>Ticket not found.</p>
          <Link to="/portal/support/new" className="pt-link" style={{ fontSize: 12 }}>
            Raise a new ticket →
          </Link>
        </div>
      </div>
    );

  const canReply = ticket.status !== 'closed';

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
          ✉
        </div>
        <div style={{ padding: '14px 0 12px 0', flex: 1 }}>
          <h1>{ticket.subject}</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{ticket.ticket_no}</span>
            <span style={{ color: '#9ba19d' }}>·</span>
            <span>{ticket.category}</span>
            <span style={{ color: '#9ba19d' }}>·</span>
            <span style={{ textTransform: 'capitalize' }}>Priority: {ticket.priority}</span>
          </p>
        </div>
        <div style={{ padding: '0 22px', flexShrink: 0 }}>
          <span className={STATUS_CLASS[ticket.status] ?? 'pt-status pt-status-grey'}>{ticket.status}</span>
        </div>
      </div>

      {/* Original description */}
      {ticket.description && (
        <div className="pt-section">
          <div className="pt-section-head">
            <h2>Your message</h2>
          </div>
          <div className="pt-section-body" style={{ padding: '14px 22px' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#3c4540' }}>{ticket.description}</p>
          </div>
        </div>
      )}

      {/* SLA */}
      {(ticket.sla_response_due || ticket.sla_resolution_due) && (
        <div className="pt-section">
          <div className="pt-section-head">
            <h2>SLA</h2>
          </div>
          <div className="pt-section-body" style={{ padding: '4px 22px 14px' }}>
            {ticket.sla_response_due && (
              <div
                style={{
                  display: 'flex',
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
                  Response due
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1d2f25' }}>
                  {new Date(ticket.sla_response_due).toLocaleString()}
                </span>
              </div>
            )}
            {ticket.sla_resolution_due && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span
                  style={{
                    fontSize: 9,
                    color: '#69736d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 800,
                  }}
                >
                  Resolution due
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1d2f25' }}>
                  {new Date(ticket.sla_resolution_due).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reply */}
      {canReply && (
        <div className="pt-section">
          <div className="pt-section-head">
            <h2>Add a reply</h2>
          </div>
          <div
            className="pt-section-body"
            style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {sent && (
              <div className="pt-alert pt-alert-green" style={{ borderBottom: 'none' }}>
                Reply sent. Our team will respond shortly.
              </div>
            )}
            <textarea
              className="pt-textarea"
              rows={4}
              placeholder="Describe any updates or additional information…"
              value={reply}
              onChange={(e) => {
                setReply(e.target.value);
                setSent(false);
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="pt-btn-primary"
                onClick={() => sendReply.mutate()}
                disabled={sendReply.isPending || !reply.trim()}
              >
                {sendReply.isPending ? 'Sending…' : 'Send reply →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {ticket.status === 'closed' && (
        <div className="pt-alert pt-alert-green" style={{ margin: '0' }}>
          This ticket is closed.{' '}
          <Link to="/portal/support/new" className="pt-link">
            Open a new ticket →
          </Link>
        </div>
      )}

      <div className="pt-doc-footer">
        <span>TCOIN Solar UG · Customer Portal</span>
        <span>For urgent issues call our hotline directly.</span>
      </div>
    </div>
  );
}
