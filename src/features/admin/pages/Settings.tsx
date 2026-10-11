import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';

const KEYS = [
  { key: 'company_name', label: 'Company name' },
  { key: 'default_currency', label: 'Default currency' },
  { key: 'vat_rate_pct', label: 'VAT rate (%)' },
  { key: 'sla_response_hours', label: 'Default SLA response (hours)' },
  { key: 'sla_resolution_hours', label: 'Default SLA resolution (hours)' },
  { key: 'lead_retention_days', label: 'Lead retention (days)' },
];

function SettingRow({ settingKey, label }: { settingKey: string; label: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['setting', settingKey],
    queryFn: () =>
      api
        .get(`/settings/${settingKey}`)
        .then((r) => r.data.value ?? '')
        .catch(() => ''),
    staleTime: 60_000,
  });
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');

  const save = useMutation({
    mutationFn: () => api.put(`/settings/${settingKey}`, { value: val }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['setting', settingKey] });
      setEditing(false);
    },
  });

  if (isLoading) return null;

  return (
    <div className="flex items-center justify-between border-b border-line py-3 last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-ink-muted font-mono">{settingKey}</p>
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            className="rounded border border-line px-2 py-1 text-sm w-40"
            defaultValue={String(data)}
            onChange={(e) => setVal(e.target.value)}
          />
          <Button variant="secondary" className="py-1 text-xs" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          <Button className="py-1 text-xs" onClick={() => save.mutate()} busy={save.isPending}>
            Save
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm">{String(data ?? '—')}</span>
          <button
            onClick={() => {
              setVal(String(data ?? ''));
              setEditing(true);
            }}
            className="text-xs text-brand-green underline"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-green">Settings</h1>
      <div className="mt-6 rounded-lg border border-line bg-white px-4">
        {KEYS.map((k) => (
          <SettingRow key={k.key} settingKey={k.key} label={k.label} />
        ))}
      </div>
    </div>
  );
}
