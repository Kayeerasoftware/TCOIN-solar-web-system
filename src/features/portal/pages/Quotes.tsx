import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import { SizeASystem, type SizingOutput } from '../components/SizeASystem';
import { SizedSystemResult, SizedSystemsList } from '../components/SizedSystemResult';
import { FreeQuotation, type QuotationPrefill } from '../components/FreeQuotation';
import type { SavedQuote } from '../savedQuotes';
import '../portal.css';

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

const STATUS_CLASS: Record<string, string> = {
  draft: 'pt-status pt-status-grey',
  sent: 'pt-status pt-status-amber',
  accepted: 'pt-status pt-status-green',
  expired: 'pt-status pt-status-red',
};

type Tab = 'maker' | 'saved' | 'free' | 'official';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'maker', label: 'Size a System', icon: '⚡' },
  { id: 'saved', label: 'Sized Systems', icon: '📐' },
  { id: 'free', label: 'Get a Free Quotation', icon: '📄' },
  { id: 'official', label: 'My Quotes', icon: '✅' },
];

export default function Quotes() {
  const [tab, setTab] = useState<Tab>('maker');

  // Sizing result flows from "Size a System" → "Sized Systems" → "Get a Free Quotation"
  const [sizingOutput, setSizingOutput] = useState<SizingOutput | null>(null);
  const [selectedSaved, setSelectedSaved] = useState<SavedQuote | null>(null);
  const [quotePrefill, setQuotePrefill] = useState<QuotationPrefill | null>(null);

  function handleResult(output: SizingOutput) {
    setSizingOutput(output);
    setSelectedSaved(null);
    setTab('saved');
  }

  function handleDraftQuotation() {
    const src =
      sizingOutput ??
      (selectedSaved
        ? {
            result: selectedSaved.sizing!,
            appliances: selectedSaved.appliances ?? [],
            district: selectedSaved.district ?? '',
            systemType: selectedSaved.system_type!,
            clientName: selectedSaved.name,
          }
        : null);
    if (src) {
      setQuotePrefill({
        result: src.result,
        appliances: src.appliances,
        district: src.district,
        systemType: src.systemType,
        clientName: src.clientName,
      });
    }
    setTab('free');
  }

  function handleRecalculate() {
    setSelectedSaved(null);
    setTab('maker');
  }

  const { data, isLoading } = useQuery({
    queryKey: ['portal-quotes-all'],
    queryFn: () => api.get('/quotes?limit=50').then((r) => r.data.data ?? []),
    staleTime: 30_000,
    enabled: tab === 'official',
  });

  const quotes: {
    id: string;
    quote_no: string;
    status: string;
    valid_until?: string;
    version?: { total?: { amount: string; currency: string } };
  }[] = data ?? [];

  return (
    <div className="pt-doc">
      {/* Page header */}
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
          📋
        </div>
        <div style={{ padding: '14px 22px 12px 0' }}>
          <h1>Invoices &amp; Quotations</h1>
          <p>Size your system, draft a quotation, or view official quotes from TCOIN.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #173b28', background: '#f1f4f1' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: '10px 8px',
              border: 'none',
              borderBottom: tab === t.id ? '3px solid #14723a' : '3px solid transparent',
              background: tab === t.id ? '#fff' : 'transparent',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: tab === t.id ? '#14723a' : '#69736d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Size a System ── */}
      {tab === 'maker' && (
        <SizeASystem
          onResult={handleResult}
          initialValues={
            sizingOutput
              ? {
                  mode: sizingOutput.mode,
                  bill: sizingOutput.bill,
                  appliances: sizingOutput.appliances,
                  district: sizingOutput.district,
                  systemType: sizingOutput.systemType,
                  clientName: sizingOutput.clientName,
                }
              : undefined
          }
        />
      )}

      {/* ── Sized Systems ── */}
      {tab === 'saved' &&
        (sizingOutput ? (
          <SizedSystemResult
            result={sizingOutput.result}
            appliances={sizingOutput.appliances}
            district={sizingOutput.district}
            systemType={sizingOutput.systemType}
            clientName={sizingOutput.clientName}
            mode={sizingOutput.mode}
            bill={sizingOutput.bill}
            onDraftQuotation={handleDraftQuotation}
            onRecalculate={handleRecalculate}
          />
        ) : selectedSaved ? (
          <SizedSystemResult
            result={selectedSaved.sizing!}
            appliances={selectedSaved.appliances ?? []}
            district={selectedSaved.district ?? ''}
            systemType={selectedSaved.system_type!}
            clientName={selectedSaved.name}
            savedRef={selectedSaved.ref}
            onDraftQuotation={handleDraftQuotation}
            onRecalculate={() => {
              setSelectedSaved(null);
            }}
          />
        ) : (
          <SizedSystemsList onOpen={(q) => setSelectedSaved(q)} />
        ))}

      {/* ── Get a Free Quotation ── */}
      {tab === 'free' && (
        <FreeQuotation
          key={quotePrefill ? `pf-${quotePrefill.result.dailyWh}` : 'empty'}
          prefill={quotePrefill ?? undefined}
          onSaved={() => setQuotePrefill(null)}
        />
      )}

      {/* ── My Quotes (official, server-side) ── */}
      {tab === 'official' && (
        <>
          {isLoading && (
            <div style={{ padding: 32 }}>
              <LoadingState />
            </div>
          )}

          {!isLoading && quotes.length === 0 && (
            <div className="pt-empty">
              <span className="pt-empty-icon">📋</span>
              <p>No official quotes yet</p>
              <span>Use "Get a Free Quotation" or "Size a System" to request one.</span>
            </div>
          )}

          {!isLoading && quotes.length > 0 && (
            <>
              <div
                className="pt-row pt-row-head"
                style={{ gridTemplateColumns: '130px 130px 160px 110px 80px' }}
              >
                <span>Quote No.</span>
                <span>Valid Until</span>
                <span>Amount</span>
                <span style={{ justifyContent: 'center' }}>Status</span>
                <span style={{ justifyContent: 'center' }}>Open</span>
              </div>

              {quotes.map((q) => (
                <div
                  key={q.id}
                  className="pt-row"
                  style={{ gridTemplateColumns: '130px 130px 160px 110px 80px' }}
                >
                  <span style={{ fontWeight: 700, fontSize: 12, color: '#1d2f25' }}>{q.quote_no}</span>
                  <span style={{ fontSize: 11, color: '#69736d' }}>
                    {q.valid_until
                      ? new Date(q.valid_until).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>
                    {q.version?.total ? `UGX ${fmt(q.version.total.amount)}` : '—'}
                  </span>
                  <span style={{ justifyContent: 'center' }}>
                    <span className={STATUS_CLASS[q.status] ?? 'pt-status pt-status-grey'}>{q.status}</span>
                  </span>
                  <span style={{ justifyContent: 'center' }}>
                    <Link to={`/portal/quotes/${q.id}`} className="pt-link" style={{ fontSize: 11 }}>
                      View →
                    </Link>
                  </span>
                </div>
              ))}

              <div className="pt-doc-footer">
                <span>
                  {quotes.length} quote{quotes.length !== 1 ? 's' : ''} on record
                </span>
                <span>E&amp;OE · Prices subject to site survey confirmation.</span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
