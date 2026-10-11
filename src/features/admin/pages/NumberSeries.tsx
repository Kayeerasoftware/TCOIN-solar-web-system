import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function NumberSeries() {
  const { data, isLoading } = useQuery({
    queryKey: ['number-series'],
    queryFn: () =>
      api
        .get('/settings/number_series')
        .then((r) => r.data.value ?? [])
        .catch(() => []),
    staleTime: 60_000,
  });

  if (isLoading) return <LoadingState />;
  const series: {
    doc_type: string;
    division_code: string;
    prefix: string;
    include_year: boolean;
    pad: number;
  }[] = Array.isArray(data) ? data : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Number series</h1>
      <p className="mt-1 text-sm text-ink-muted">Document numbering sequences. Managed server-side.</p>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Document type</th>
              <th className="px-4 py-2 text-left">Division</th>
              <th className="px-4 py-2 text-left">Prefix</th>
              <th className="px-4 py-2 text-center">Year</th>
              <th className="px-4 py-2 text-right">Pad</th>
            </tr>
          </thead>
          <tbody>
            {series.map((s) => (
              <tr
                key={`${s.doc_type}-${s.division_code}`}
                className="border-b border-line last:border-0 hover:bg-surface-alt"
              >
                <td className="px-4 py-2 font-medium capitalize">{s.doc_type.replace(/_/g, ' ')}</td>
                <td className="px-4 py-2 text-ink-muted">{s.division_code}</td>
                <td className="px-4 py-2 font-mono text-xs">{s.prefix}</td>
                <td className="px-4 py-2 text-center">{s.include_year ? '✓' : '—'}</td>
                <td className="px-4 py-2 text-right text-ink-muted">{s.pad}</td>
              </tr>
            ))}
            {series.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  No series configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
