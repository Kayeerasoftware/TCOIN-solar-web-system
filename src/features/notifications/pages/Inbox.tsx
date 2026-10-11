import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function Inbox() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications?limit=50').then((r) => r.data.data ?? []),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}`, { read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (isLoading) return <LoadingState />;
  const notes: {
    id: string;
    channel: string;
    subject?: string;
    body?: string;
    read_at?: string;
    created_at: string;
  }[] = data ?? [];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-green">Notifications</h1>
      {notes.length === 0 && <p className="mt-6 text-ink-muted">No notifications.</p>}
      <div className="mt-4 space-y-2">
        {notes.map((n) => (
          <div
            key={n.id}
            className={`rounded-lg border p-4 ${n.read_at ? 'border-line bg-white' : 'border-brand-green bg-green-50'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {n.subject && <p className="font-medium text-sm">{n.subject}</p>}
                {n.body && <p className="mt-0.5 text-sm text-ink-muted">{n.body}</p>}
                <p className="mt-1 text-xs text-ink-muted">
                  {new Date(n.created_at).toLocaleString()} · {n.channel}
                </p>
              </div>
              {!n.read_at && (
                <button
                  onClick={() => markRead.mutate(n.id)}
                  className="shrink-0 text-xs text-brand-green underline"
                >
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
