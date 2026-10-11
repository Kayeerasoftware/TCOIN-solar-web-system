import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function Users() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', q],
    queryFn: () =>
      api.get('/customers', { params: { limit: 100, q: q || undefined } }).then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => api.patch(`/customers/${id}`, { active: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (isLoading) return <LoadingState />;
  const users: {
    id: string;
    customer_no: string;
    display_name: string;
    email?: string;
    phone?: string;
    customer_type: string;
    created_at?: string;
  }[] = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green">Users &amp; customers</h1>
      </div>
      <div className="mt-4">
        <input
          className="w-full max-w-sm rounded border border-line px-3 py-2 text-sm"
          placeholder="Search by name, email, phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">No.</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Contact</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Joined</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 text-ink-muted">{u.customer_no}</td>
                <td className="px-4 py-2 font-medium">{u.display_name}</td>
                <td className="px-4 py-2 text-ink-muted">{u.email ?? u.phone ?? '—'}</td>
                <td className="px-4 py-2">
                  <Badge tone="grey">{u.customer_type}</Badge>
                </td>
                <td className="px-4 py-2 text-ink-muted">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2 text-right">
                  <Button
                    variant="secondary"
                    className="py-0.5 text-xs"
                    onClick={() => deactivate.mutate(u.id)}
                    busy={deactivate.isPending}
                  >
                    Deactivate
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
