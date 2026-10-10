import { NavLink, Outlet } from 'react-router-dom';
import { fieldTabs } from '@/config/navigation';
import { useSyncStatus } from '@/offline/useSyncStatus';

/** Phone-first shell for technicians: always shows connection state and unsynced changes. */
export function FieldLayout() {
  const { online, waiting, failed } = useSyncStatus();
  return (
    <div className="flex min-h-screen flex-col bg-surface-alt pb-16">
      <div className="bg-brand-green px-4 py-3 text-white">
        <b>TCOIN SOLAR UG</b>
        <div role="status" className="text-xs text-amber-200">
          {online ? 'Online' : 'Offline'} | {waiting} change{waiting === 1 ? '' : 's'} waiting{failed ? ` | ${failed} need review` : ''}
        </div>
      </div>
      <main className="flex-1 p-3"><Outlet /></main>
      <nav aria-label="Field" className="fixed inset-x-0 bottom-0 flex border-t border-line bg-white">
        {fieldTabs.map((t) => (
          <NavLink key={t.to} to={t.to} end className={({ isActive }) => `flex-1 py-3 text-center text-sm ${isActive ? 'font-bold text-brand-green' : 'text-ink'}`}>{t.label}</NavLink>
        ))}
      </nav>
    </div>
  );
}
