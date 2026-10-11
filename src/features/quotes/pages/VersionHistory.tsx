import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function VersionHistory() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['quote-versions', id],
    queryFn: () => api.get(`/quotes/${id}/versions`).then((r) => r.data.data ?? []),
    enabled: !!id,
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-brand-green">Version history</h1>
      <div className="mt-6 space-y-3">
        {(data ?? []).map(
          (v: {
            id: string;
            version_no: number;
            subtotal: { amount: string; currency: string };
            total: { amount: string };
            sent_at?: string;
            created_by?: string;
          }) => (
            <div key={v.id} className="rounded-lg border border-line bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold">Version {v.version_no}</p>
                <p className="font-medium">
                  {v.subtotal?.currency} {Number(v.total?.amount ?? 0).toLocaleString()}
                </p>
              </div>
              {v.sent_at && (
                <p className="text-xs text-ink-muted mt-1">Sent {new Date(v.sent_at).toLocaleString()}</p>
              )}
            </div>
          ),
        )}
        {(data ?? []).length === 0 && <p className="text-ink-muted">No versions yet.</p>}
      </div>
    </div>
  );
}
