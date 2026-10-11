import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [note, setNote] = useState('');

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => api.get(`/leads/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const logActivity = useMutation({
    mutationFn: () =>
      api.post('/activities', { subject_type: 'lead', subject_id: id, activity_type: 'note', note }),
    onSuccess: () => {
      setNote('');
      qc.invalidateQueries({ queryKey: ['lead', id] });
    },
  });

  const convert = useMutation({
    mutationFn: () => api.post(`/leads/${id}/convert`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lead', id] }),
  });

  if (isLoading) return <LoadingState />;
  if (!lead) return <p className="p-8 text-ink-muted">Lead not found.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{lead.full_name}</h1>
          <p className="text-sm text-ink-muted">
            {lead.lead_no} · <span className="capitalize">{lead.status}</span>
          </p>
        </div>
        {lead.status !== 'converted' && lead.status !== 'lost' && (
          <Button onClick={() => convert.mutate()} busy={convert.isPending}>
            Convert to customer
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-line bg-white p-5 grid grid-cols-2 gap-3 text-sm">
        {[
          ['Phone', lead.phone],
          ['Email', lead.email],
          ['Location', lead.location],
          ['Interest', lead.service_interest],
          ['Source', lead.source_code],
          ['Campaign', lead.campaign],
        ].map(([k, v]) =>
          v ? (
            <div key={k as string}>
              <p className="text-xs text-ink-muted">{k}</p>
              <p className="font-medium">{v}</p>
            </div>
          ) : null,
        )}
      </div>

      {lead.message && (
        <div className="rounded-lg border border-line bg-white p-4 text-sm text-ink-muted">
          <p className="font-medium text-ink mb-1">Message</p>
          {lead.message}
        </div>
      )}

      <div>
        <h2 className="font-bold">Log a note</h2>
        <textarea
          className="mt-2 w-full rounded border border-line px-3 py-2 text-sm"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Call notes, follow-up actions…"
        />
        <Button
          className="mt-2"
          onClick={() => logActivity.mutate()}
          busy={logActivity.isPending}
          disabled={!note.trim()}
        >
          Save note
        </Button>
      </div>
    </div>
  );
}
