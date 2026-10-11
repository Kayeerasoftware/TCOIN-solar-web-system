import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function MaintenanceCalendar() {
  const today = new Date().toISOString().slice(0, 10);

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance-schedule', today],
    queryFn: () => api.get('/work-orders', { params: { limit: 100 } }).then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingState />;

  const orders: { id: string; wo_no: string; wo_type: string; scheduled_start?: string; status: string }[] = (
    data ?? []
  ).filter((o: { scheduled_start?: string }) => o.scheduled_start);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Maintenance calendar</h1>
      <p className="mt-1 text-sm text-ink-muted">Upcoming scheduled work orders</p>
      {orders.length === 0 && (
        <p className="mt-6 text-ink-muted">No scheduled work orders in the next 30 days.</p>
      )}
      <div className="mt-6 space-y-3">
        {orders.map((o) => (
          <div
            key={o.id}
            className="flex items-center gap-4 rounded-lg border border-line bg-white p-4 text-sm"
          >
            <div className="w-20 text-center rounded bg-brand-green text-white p-2">
              <p className="text-xs">
                {o.scheduled_start
                  ? new Date(o.scheduled_start).toLocaleDateString('en-UG', { month: 'short' })
                  : ''}
              </p>
              <p className="text-xl font-bold">
                {o.scheduled_start ? new Date(o.scheduled_start).getDate() : ''}
              </p>
            </div>
            <div className="flex-1">
              <p className="font-medium">{o.wo_no}</p>
              <p className="text-xs text-ink-muted capitalize">{o.wo_type?.replace(/_/g, ' ')}</p>
            </div>
            <span className="text-xs capitalize text-ink-muted">{o.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
