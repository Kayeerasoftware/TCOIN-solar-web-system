import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';

export default function SiteSurveyForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_id: '',
    roof_type: 'pitched',
    roof_area_m2: '',
    tilt_deg: '15',
    azimuth_deg: '180',
    shading_pct: '0',
    structure_notes: '',
  });

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  const create = useMutation({
    mutationFn: () =>
      api.post('/site-surveys', {
        customer_id: form.customer_id,
        roof_type: form.roof_type,
        roof_area_m2: form.roof_area_m2 ? +form.roof_area_m2 : undefined,
        tilt_deg: +form.tilt_deg,
        azimuth_deg: +form.azimuth_deg,
        shading_pct: +form.shading_pct,
        structure_notes: form.structure_notes || undefined,
        client_uuid: crypto.randomUUID(),
      }),
    onSuccess: (res) => navigate(`/console/designs/${res.data.id}`),
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-green">New site survey</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
        className="mt-6 space-y-4"
      >
        {create.isError && (
          <p className="rounded bg-red-50 p-2 text-sm text-brand-red">Could not save survey.</p>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium">Customer ID *</label>
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            required
            value={form.customer_id}
            onChange={set('customer_id')}
            placeholder="UUID of customer"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Roof type</label>
            <select
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={form.roof_type}
              onChange={set('roof_type')}
            >
              {['pitched', 'flat', 'metal_sheet', 'concrete', 'other'].map((t) => (
                <option key={t} value={t} className="capitalize">
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Roof area (m²)</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              type="number"
              step="any"
              min="0"
              value={form.roof_area_m2}
              onChange={set('roof_area_m2')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tilt (°)</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              type="number"
              min="0"
              max="90"
              value={form.tilt_deg}
              onChange={set('tilt_deg')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Azimuth (°)</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              type="number"
              min="0"
              max="360"
              value={form.azimuth_deg}
              onChange={set('azimuth_deg')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Shading (%)</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              type="number"
              min="0"
              max="100"
              value={form.shading_pct}
              onChange={set('shading_pct')}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Structure notes</label>
          <textarea
            className="w-full rounded border border-line px-3 py-2 text-sm"
            rows={3}
            value={form.structure_notes}
            onChange={set('structure_notes')}
            placeholder="Observations about roof structure, access, etc."
          />
        </div>
        <Button type="submit" busy={create.isPending} className="w-full">
          Save survey &amp; open design workspace
        </Button>
      </form>
    </div>
  );
}
