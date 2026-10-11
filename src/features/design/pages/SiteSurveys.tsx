import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';

export default function SiteSurveys() {
  const { data, isLoading } = useQuery({
    queryKey: ['site-surveys'],
    queryFn: () => api.get('/site-surveys?limit=100').then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;

  const surveys: {
    id: string;
    survey_no: string;
    customer_id: string;
    roof_type?: string;
    roof_area_m2?: number;
    created_at?: string;
  }[] = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green">Site surveys</h1>
        <Link to="/console/surveys/new">
          <Button>+ New survey</Button>
        </Link>
      </div>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Survey #</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Roof type</th>
              <th className="px-4 py-2 text-right">Area (m²)</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((s) => (
              <tr key={s.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 font-medium">{s.survey_no}</td>
                <td className="px-4 py-2 text-ink-muted">{s.customer_id}</td>
                <td className="px-4 py-2 capitalize text-ink-muted">{s.roof_type ?? '—'}</td>
                <td className="px-4 py-2 text-right text-ink-muted">{s.roof_area_m2 ?? '—'}</td>
                <td className="px-4 py-2 text-ink-muted">
                  {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link to={`/console/designs/${s.id}`} className="text-xs text-brand-green underline">
                    Design →
                  </Link>
                </td>
              </tr>
            ))}
            {surveys.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  No surveys yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
