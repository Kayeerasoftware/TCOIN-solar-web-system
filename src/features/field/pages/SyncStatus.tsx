import { useSyncStatus } from '@/offline/useSyncStatus';

export default function SyncStatus() {
  const { online, waiting, failed } = useSyncStatus();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Sync status</h1>

      <div
        className={`rounded-lg p-4 ${online ? 'bg-green-50 border border-brand-green' : 'bg-yellow-50 border border-yellow-400'}`}
      >
        <p className="font-bold">{online ? '🟢 Online' : '🟡 Offline'}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {online ? 'Connected to server' : 'Working offline — changes will sync when connection is restored'}
        </p>
      </div>

      <div className="rounded-lg border border-line bg-white p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Changes waiting to sync</span>
          <strong>{waiting}</strong>
        </div>
        <div className="flex justify-between">
          <span>Changes needing review</span>
          <strong className={failed > 0 ? 'text-brand-red' : ''}>{failed}</strong>
        </div>
      </div>

      {online && waiting === 0 && failed === 0 && (
        <p className="text-sm text-brand-green">✓ All changes synced.</p>
      )}

      {failed > 0 && (
        <div className="rounded-lg border border-brand-red bg-red-50 p-4 text-sm">
          <p className="font-bold text-brand-red">
            {failed} change{failed > 1 ? 's' : ''} rejected by server
          </p>
          <p className="mt-1 text-ink-muted">
            Review the rejected changes and resolve conflicts before they can be applied.
          </p>
        </div>
      )}
    </div>
  );
}
