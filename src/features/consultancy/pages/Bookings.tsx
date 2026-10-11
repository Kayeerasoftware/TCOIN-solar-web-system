import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Badge } from '@/components/ui/Badge';

const STATUS_TONE: Record<string, 'green' | 'amber' | 'grey' | 'red'> = {
  confirmed: 'green',
  pending: 'amber',
  cancelled: 'red',
  completed: 'grey',
};

export default function Bookings() {
  const { data, isLoading } = useQuery({
    queryKey: ['consultancy-bookings'],
    queryFn: () =>
      api
        .get('/bookings?limit=100')
        .then((r) => r.data.data ?? [])
        .catch(() => []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;
  const bookings: {
    id: string;
    booking_no: string;
    service_id: string;
    starts_at: string;
    ends_at: string;
    status: string;
    invoice_id?: string;
  }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Consultancy bookings</h1>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Booking #</th>
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-left">Starts</th>
              <th className="px-4 py-2 text-left">Ends</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 font-medium">{b.booking_no}</td>
                <td className="px-4 py-2 text-ink-muted truncate max-w-[120px]">{b.service_id}</td>
                <td className="px-4 py-2 text-ink-muted">{new Date(b.starts_at).toLocaleString()}</td>
                <td className="px-4 py-2 text-ink-muted">{new Date(b.ends_at).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <Badge tone={STATUS_TONE[b.status] ?? 'grey'}>{b.status}</Badge>
                </td>
                <td className="px-4 py-2 text-ink-muted">
                  {b.invoice_id ? (
                    <a href={`/console/invoices/${b.invoice_id}`} className="text-brand-green underline">
                      View
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
