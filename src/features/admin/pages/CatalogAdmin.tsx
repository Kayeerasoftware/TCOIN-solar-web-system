import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';

export default function CatalogAdmin() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['catalog-admin', q],
    queryFn: () =>
      api
        .get('/catalog/products', { params: { limit: 100, q: q || undefined } })
        .then((r) => r.data.data ?? []),
    staleTime: 30_000,
  });

  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const importMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('file', file!);
      return api.post('/catalog/imports', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalog-admin'] });
      setImporting(false);
      setFile(null);
    },
  });

  if (isLoading) return <LoadingState />;
  const products: {
    id: string;
    brand: string;
    model: string;
    name: string;
    product_type: string;
    variants?: { sku: string }[];
  }[] = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green">Catalog</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setImporting((v) => !v)}>
            Import CSV/XLSX
          </Button>
        </div>
      </div>

      {importing && (
        <div className="mt-4 rounded-lg border border-line bg-white p-4 space-y-3">
          <p className="text-sm font-medium">Bulk import products or prices</p>
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setImporting(false)}>
              Cancel
            </Button>
            <Button onClick={() => importMutation.mutate()} busy={importMutation.isPending} disabled={!file}>
              Upload
            </Button>
          </div>
          {importMutation.isSuccess && (
            <p className="text-sm text-brand-green">Import queued successfully.</p>
          )}
        </div>
      )}

      <div className="mt-4">
        <input
          className="w-full max-w-sm rounded border border-line px-3 py-2 text-sm"
          placeholder="Search products…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="mt-6 rounded-lg border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Brand</th>
              <th className="px-4 py-2 text-left">Model</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-right">Variants</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-2 font-medium">
                  <Link to={`/store/${p.id}`} className="text-brand-green hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-ink-muted">{p.brand}</td>
                <td className="px-4 py-2 text-ink-muted">{p.model}</td>
                <td className="px-4 py-2 capitalize text-ink-muted">{p.product_type}</td>
                <td className="px-4 py-2 text-right text-ink-muted">{p.variants?.length ?? 0}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
