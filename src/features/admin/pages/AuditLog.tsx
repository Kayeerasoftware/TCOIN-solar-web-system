import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function AuditLog() {
  const [table, setTable] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', table],
    queryFn: () =>
      api
        .get('/audit-log', { params: { limit: 100, ...(table ? { table_name: table } : {}) } })
        .then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingState />;
  const entries: {
    id: string | number;
    at: string;
    actor_id?: string;
    action: string;
    table_name?: string;
    row_id?: string;
  }[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Audit log</h1>
      <div className="mt-4">
        <input
          className="w-full max-w-xs rounded border border-line px-3 py-2 text-sm"
          placeholder="Filter by table name…"
          value={table}
          onChange={(e) => setTable(e.target.value)}
        />
      </div>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Time</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Table</th>
              <th className="px-4 py-2 text-left">Row ID</th>
              <th className="px-4 py-2 text-left">Actor</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 text-xs text-ink-muted whitespace-nowrap">
                  {new Date(e.at).toLocaleString()}
                </td>
                <td className="px-4 py-2 font-medium capitalize">{e.action}</td>
                <td className="px-4 py-2 font-mono text-xs text-ink-muted">{e.table_name ?? '—'}</td>
                <td className="px-4 py-2 font-mono text-xs text-ink-muted truncate max-w-[120px]">
                  {e.row_id ?? '—'}
                </td>
                <td className="px-4 py-2 font-mono text-xs text-ink-muted truncate max-w-[120px]">
                  {e.actor_id ?? 'system'}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  No audit entries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
