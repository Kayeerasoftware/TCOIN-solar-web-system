import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import '../portal.css';

export default function Warranties() {
  const { data: assets, isLoading } = useQuery({
    queryKey: ['portal-assets-w'],
    queryFn: () => api.get('/assets?limit=50').then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  const list: { id: string; asset_no: string; name: string }[] = assets ?? [];

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
          🛡
        </div>
        <div style={{ padding: '14px 22px 12px 0' }}>
          <h1>Warranties</h1>
          <p>Warranty coverage for your installed equipment.</p>
        </div>
      </div>

      {isLoading && (
        <div style={{ padding: 32 }}>
          <LoadingState />
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <div className="pt-empty">
          <span className="pt-empty-icon">🛡</span>
          <p>No assets on record</p>
          <span>Warranty information will appear here after installation.</span>
        </div>
      )}

      {!isLoading &&
        list.map((a, idx) => (
          <AssetSection key={a.id} assetId={a.id} assetName={a.name ?? a.asset_no} first={idx === 0} />
        ))}

      {!isLoading && list.length > 0 && (
        <div className="pt-doc-footer">
          <span>E&amp;OE · Warranty terms are subject to manufacturer conditions.</span>
        </div>
      )}
    </div>
  );
}

function AssetSection({ assetId, assetName, first }: { assetId: string; assetName: string; first: boolean }) {
  const { data } = useQuery({
    queryKey: ['warranties', assetId],
    queryFn: () => api.get(`/assets/${assetId}/warranties`).then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });

  const warranties: {
    id: string;
    coverage_type: string;
    starts_on: string;
    ends_on: string;
    effective_status: string;
    days_remaining: number;
  }[] = data ?? [];

  return (
    <div className="pt-section">
      <div className="pt-section-head">
        <h2>{assetName}</h2>
      </div>

      {warranties.length === 0 && (
        <div style={{ padding: '12px 22px', fontSize: 11, color: '#9ba19d', fontStyle: 'italic' }}>
          No warranties on record for this asset.
        </div>
      )}

      {warranties.length > 0 && (
        <>
          {first && (
            <div
              className="pt-row pt-row-head"
              style={{ gridTemplateColumns: '1fr 130px 130px 130px 100px' }}
            >
              <span>Coverage type</span>
              <span>Starts</span>
              <span>Expires</span>
              <span>Days remaining</span>
              <span style={{ justifyContent: 'center' }}>Status</span>
            </div>
          )}
          {warranties.map((w) => {
            const isActive = w.effective_status === 'active';
            const urgent = isActive && w.days_remaining < 90;
            return (
              <div
                key={w.id}
                className="pt-row"
                style={{ gridTemplateColumns: '1fr 130px 130px 130px 100px' }}
              >
                <span
                  style={{ fontWeight: 600, fontSize: 12, color: '#1d2f25', textTransform: 'capitalize' }}
                >
                  {w.coverage_type?.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: 11, color: '#69736d' }}>{w.starts_on}</span>
                <span style={{ fontSize: 11, color: '#69736d' }}>{w.ends_on}</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: urgent ? 700 : 400,
                    color: urgent ? '#b36b00' : '#3c4540',
                  }}
                >
                  {isActive ? `${w.days_remaining} days` : '—'}
                </span>
                <span style={{ justifyContent: 'center' }}>
                  <span
                    className={
                      isActive
                        ? urgent
                          ? 'pt-status pt-status-amber'
                          : 'pt-status pt-status-green'
                        : 'pt-status pt-status-red'
                    }
                  >
                    {isActive ? 'Active' : w.effective_status}
                  </span>
                </span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
