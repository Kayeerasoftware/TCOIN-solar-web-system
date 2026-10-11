import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function SerialLookup() {
  const [serial, setSerial] = useState('');
  const [query, setQuery] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['serial', query],
    queryFn: () => api.get(`/serial-units/${encodeURIComponent(query)}`).then((r) => r.data),
    enabled: !!query,
    retry: false,
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-green">Serial number lookup</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(serial.trim());
        }}
        className="mt-6 flex gap-2"
      >
        <input
          className="flex-1 rounded border border-line px-3 py-2 text-sm"
          placeholder="Enter serial number…"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
        />
        <button
          type="submit"
          className="rounded bg-brand-green px-4 py-2 text-sm font-bold text-white hover:brightness-95"
        >
          Look up
        </button>
      </form>
      {isLoading && <LoadingState />}
      {isError && <p className="mt-4 text-sm text-brand-red">Serial number not found.</p>}
      {data && (
        <div className="mt-6 rounded-lg border border-line bg-white p-5 space-y-2 text-sm">
          <div>
            <span className="text-ink-muted">Serial:</span> <strong>{data.serial_no}</strong>
          </div>
          <div>
            <span className="text-ink-muted">Status:</span>{' '}
            <strong className="capitalize">{data.status}</strong>
          </div>
          {data.variant_id && (
            <div>
              <span className="text-ink-muted">Variant ID:</span> {data.variant_id}
            </div>
          )}
          {data.warehouse_id && (
            <div>
              <span className="text-ink-muted">Location:</span> {data.warehouse_id}
            </div>
          )}
          {data.installed_asset_id && (
            <div>
              <span className="text-ink-muted">Installed asset:</span> {data.installed_asset_id}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
