import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import '../portal.css';

const TYPE_LABEL: Record<string, string> = {
  solar_panel: 'Solar Panel Array',
  inverter: 'Inverter',
  battery: 'Battery Bank',
  pump: 'Solar Pump',
  system: 'Complete System',
};

export default function MySystems() {
  const { data: assets, isLoading } = useQuery({
    queryKey: ['portal-assets'],
    queryFn: () => api.get('/assets?limit=50').then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  const list: {
    id: string;
    asset_no: string;
    name: string;
    asset_type: string;
    serial_no?: string;
    installed_at?: string;
    status: string;
  }[] = assets ?? [];

  return (
    <div className="pt-doc">
      <div
        className="pt-page-head"
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: 0,
          minHeight: 72,
        }}
      >
        <img
          src="/brand/TCOIN LOGO OFFICIAL.svg"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            right: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            height: '160%',
            width: 'auto',
            opacity: 0.07,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
        <div
          style={{
            width: 72,
            height: 72,
            flexShrink: 0,
            background: '#f1f4f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ba19d',
            fontSize: 28,
          }}
        >
          ⚡
        </div>
        <div style={{ padding: '14px 22px 12px 0' }}>
          <h1>My Systems</h1>
          <p>Installed solar equipment registered to your account.</p>
        </div>
      </div>

      {isLoading && (
        <div style={{ padding: 32 }}>
          <LoadingState />
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <div className="pt-empty">
          <span className="pt-empty-icon">⚡</span>
          <p>No systems on record</p>
          <span>Your installed equipment will appear here after commissioning.</span>
          <br />
          <Link
            to="/store"
            className="pt-link"
            style={{ marginTop: 12, display: 'inline-block', fontSize: 12 }}
          >
            Browse Store →
          </Link>
        </div>
      )}

      {!isLoading && list.length > 0 && (
        <>
          <div className="pt-row pt-row-head" style={{ gridTemplateColumns: '1fr 160px 160px 120px 80px' }}>
            <span>Asset / Name</span>
            <span>Type</span>
            <span>Serial No.</span>
            <span>Installed</span>
            <span style={{ justifyContent: 'center' }}>Status</span>
          </div>

          {list.map((a) => (
            <div key={a.id} className="pt-row" style={{ gridTemplateColumns: '1fr 160px 160px 120px 80px' }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: '#1d2f25',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                {a.name ?? a.asset_no}
                <span style={{ fontSize: 10, color: '#9ba19d', fontWeight: 400 }}>{a.asset_no}</span>
              </span>
              <span style={{ fontSize: 11, color: '#69736d' }}>
                {TYPE_LABEL[a.asset_type] ?? a.asset_type?.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: 11, color: '#69736d', fontFamily: 'monospace' }}>
                {a.serial_no ?? '—'}
              </span>
              <span style={{ fontSize: 11, color: '#69736d' }}>
                {a.installed_at
                  ? new Date(a.installed_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </span>
              <span style={{ justifyContent: 'center' }}>
                <span
                  className={a.status === 'active' ? 'pt-status pt-status-green' : 'pt-status pt-status-grey'}
                >
                  {a.status}
                </span>
              </span>
            </div>
          ))}

          <div className="pt-doc-footer">
            <span>
              {list.length} asset{list.length !== 1 ? 's' : ''} registered
            </span>
            <Link to="/portal/warranties" className="pt-link">
              View warranties →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
