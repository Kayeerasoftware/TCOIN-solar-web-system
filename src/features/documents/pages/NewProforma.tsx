import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';

export default function NewProforma() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [quoteId, setQuoteId] = useState(params.get('quote_id') ?? '');
  const [form, setForm] = useState({
    document_title: 'PROFORMA INVOICE',
    bill_to_text: '',
    validity_days: '30',
    show_images: true,
    show_eoe: true,
    signatory_id: '',
  });

  const { data: signatories } = useQuery({
    queryKey: ['signatories'],
    queryFn: () => api.get('/signatories').then((r) => r.data.data ?? []),
    staleTime: 300_000,
  });

  const issue = useMutation({
    mutationFn: () =>
      api.post(`/quotes/${quoteId}/proforma`, {
        ...form,
        validity_days: +form.validity_days,
        signatory_id: form.signatory_id || undefined,
      }),
    onSuccess: () => navigate('/console/documents'),
  });

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({
        ...f,
        [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value,
      }));
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-green">Issue proforma invoice</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          issue.mutate();
        }}
        className="mt-6 space-y-4"
      >
        {issue.isError && (
          <p className="rounded bg-red-50 p-2 text-sm text-brand-red">Could not issue proforma.</p>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium">Quote ID *</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            required
            value={quoteId}
            onChange={(e) => setQuoteId(e.target.value)}
            placeholder="Quote UUID"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Document title</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            value={form.document_title}
            onChange={set('document_title')}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Bill to</label>
          <textarea
            className="w-full rounded border border-line px-3 py-2 text-sm"
            rows={3}
            value={form.bill_to_text}
            onChange={(e) => setForm((f) => ({ ...f, bill_to_text: e.target.value }))}
            placeholder="M/s Company Name&#10;Address line 1"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Validity (days)</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              type="number"
              min="1"
              value={form.validity_days}
              onChange={set('validity_days')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Signatory</label>
            <select
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={form.signatory_id}
              onChange={set('signatory_id')}
            >
              <option value="">— select —</option>
              {(signatories ?? []).map((s: { id: string; display_name: string }) => (
                <option key={s.id} value={s.id}>
                  {s.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.show_images} onChange={set('show_images')} />
            Show item images
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.show_eoe} onChange={set('show_eoe')} />
            Show E&amp;OE
          </label>
        </div>
        <Button type="submit" busy={issue.isPending} className="w-full">
          Issue proforma invoice
        </Button>
      </form>
    </div>
  );
}
