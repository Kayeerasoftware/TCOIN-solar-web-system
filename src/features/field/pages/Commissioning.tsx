import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';

export default function Commissioning() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    voc_v: '',
    isc_a: '',
    insulation_mohm: '',
    earth_ohm: '',
    first_day_kwh: '',
  });

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  const save = useMutation({
    mutationFn: () =>
      api.put(`/projects/${id}/commissioning`, {
        voc_v: +form.voc_v,
        isc_a: +form.isc_a,
        insulation_mohm: +form.insulation_mohm,
        earth_ohm: form.earth_ohm ? +form.earth_ohm : undefined,
        first_day_kwh: form.first_day_kwh ? +form.first_day_kwh : undefined,
      }),
    onSuccess: () => navigate(`/field/jobs/${id}/sign-off`),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Commissioning readings</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="space-y-3"
      >
        {(
          [
            { key: 'voc_v', label: 'Voc (V)', required: true },
            { key: 'isc_a', label: 'Isc (A)', required: true },
            { key: 'insulation_mohm', label: 'Insulation (MΩ)', required: true },
            { key: 'earth_ohm', label: 'Earth (Ω)', required: false },
            { key: 'first_day_kwh', label: 'First day yield (kWh)', required: false },
          ] as { key: keyof typeof form; label: string; required: boolean }[]
        ).map(({ key, label, required }) => (
          <div key={key}>
            <label className="mb-1 block text-sm font-medium">
              {label}
              {required && ' *'}
            </label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              type="number"
              step="any"
              required={required}
              value={form[key]}
              onChange={set(key)}
            />
          </div>
        ))}
        {save.isError && <p className="text-sm text-brand-red">Save failed. Check values.</p>}
        <Button type="submit" busy={save.isPending} className="w-full">
          Save &amp; continue →
        </Button>
      </form>
    </div>
  );
}
