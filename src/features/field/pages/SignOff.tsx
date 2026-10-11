import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';

export default function SignOff() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  const handover = useMutation({
    mutationFn: () => api.post(`/projects/${id}/handover`),
    onSuccess: () => navigate('/field'),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Sign-off &amp; delivery note</h1>
      <p className="text-sm text-ink-muted">
        Confirm the customer has received and accepted the installation.
      </p>
      <div>
        <label className="mb-1 block text-sm font-medium">Customer name *</label>
        <input
          className="w-full rounded border border-line px-3 py-2 text-sm"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Full name of person accepting"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Notes</label>
        <textarea
          className="w-full rounded border border-line px-3 py-2 text-sm"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any outstanding items, observations…"
        />
      </div>
      {handover.isError && (
        <p className="text-sm text-brand-red">Handover failed. Ensure commissioning is complete.</p>
      )}
      {handover.isSuccess && (
        <p className="text-sm text-brand-green">✓ Job completed and handover pack generated.</p>
      )}
      <Button
        className="w-full"
        onClick={() => handover.mutate()}
        busy={handover.isPending}
        disabled={!customerName || handover.isSuccess}
      >
        Complete job &amp; generate delivery note
      </Button>
    </div>
  );
}
