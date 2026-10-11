import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';

export default function DocumentsCentre() {
  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () =>
      api
        .get('/documents?limit=50')
        .then((r) => r.data.data ?? [])
        .catch(() => []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  const docs: { id: string; doc_type: string; title: string; created_at?: string }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Documents centre</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/console/documents/proforma/new">
          <Button variant="secondary">+ Proforma invoice</Button>
        </Link>
        <Link to="/console/documents/receipt/new">
          <Button variant="secondary">+ Receipt</Button>
        </Link>
        <Link to="/console/documents/voucher/new">
          <Button variant="secondary">+ Payment voucher</Button>
        </Link>
        <Link to="/console/documents/delivery-note/new">
          <Button variant="secondary">+ Delivery note</Button>
        </Link>
        <Link to="/console/documents/letter/new">
          <Button variant="secondary">+ Letter</Button>
        </Link>
      </div>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 font-medium">{d.title}</td>
                <td className="px-4 py-2 capitalize text-ink-muted">{d.doc_type?.replace(/_/g, ' ')}</td>
                <td className="px-4 py-2 text-ink-muted">
                  {d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2 text-right">
                  <a
                    href={`/api/v1/documents/${d.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-green underline"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
            {docs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                  No documents yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
