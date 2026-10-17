import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';
import { SizeASystem, type SizingOutput } from '../components/SizeASystem';
import { SizedSystemResult, SizedSystemsList } from '../components/SizedSystemResult';
import { FreeQuotation, type QuotationPrefill } from '../components/FreeQuotation';
import { loadSavedQuotes, deleteQuote, type SavedQuote } from '../savedQuotes';
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

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function printFreeQuote(q: SavedQuote) {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  const lines = q.lines ?? [];
  const rows = lines
    .map(
      (l, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f7f9f7'}">
      <td style="text-align:center;color:#9ba19d;font-size:10px;font-weight:700;border-right:1px solid #e0e5e2;padding:5px 4px">${i + 1}</td>
      <td style="border-right:1px solid #e0e5e2;padding:5px 7px;font-weight:700;font-size:11px;vertical-align:top">${l.particulars}</td>
      <td style="border-right:1px solid #e0e5e2;padding:5px 7px;color:#555f59;font-size:10px;line-height:1.5;vertical-align:top">${l.spec || '&mdash;'}</td>
      <td style="border-right:1px solid #e0e5e2;padding:5px 7px;text-align:center;font-weight:600">${l.qty}</td>
      <td style="border-right:1px solid #e0e5e2;padding:5px 7px;text-align:center;color:#69736d">${l.unit}</td>
      <td style="border-right:1px solid #e0e5e2;padding:5px 7px;text-align:right">${l.rate > 0 ? Number(l.rate).toLocaleString('en-UG') : '&mdash;'}</td>
      <td style="padding:5px 7px;text-align:right;font-weight:700">${l.amount > 0 ? Number(l.amount).toLocaleString('en-UG') : '&mdash;'}</td>
    </tr>`,
    )
    .join('');
  const totals = [
    { label: 'Subtotal', val: q.subtotal ?? 0, bold: false },
    { label: 'VAT (18%)', val: q.vat ?? 0, bold: false },
    { label: 'TOTAL', val: q.total ?? 0, bold: true },
  ]
    .map(
      ({ label, val, bold }) => `
    <tr style="background:${bold ? '#173b28' : '#fff'}">
      <td colspan="5"></td>
      <td style="padding:6px 10px;text-align:right;font-size:${bold ? 12 : 11}px;font-weight:${bold ? 900 : 400};color:${bold ? '#eaf3b5' : '#69736d'};border-top:${bold ? '2px solid #173b28' : '1px solid #e0e5e2'};border-right:1px solid ${bold ? 'rgba(255,255,255,.2)' : '#e0e5e2'}">${label}</td>
      <td style="padding:6px 10px;text-align:right;font-size:${bold ? 12 : 11}px;font-weight:${bold ? 900 : 400};color:${bold ? '#eaf3b5' : '#69736d'};border-top:${bold ? '2px solid #173b28' : '1px solid #e0e5e2'}">UGX ${Number(val).toLocaleString('en-UG')}</td>
    </tr>`,
    )
    .join('');
  const SYSTEM_LABEL: Record<string, string> = {
    hybrid: 'Hybrid (Grid + Battery)',
    on_grid: 'On-Grid (Grid-Tied)',
    off_grid: 'Off-Grid (Battery Only)',
  };
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>${q.ref}</title>
    <style>
      @page{size:A4;margin:12mm 10mm;} *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      body{margin:0;font-family:'DM Sans',Arial,sans-serif;color:#18201b;font-size:11px;}
      .mh{display:flex;align-items:center;justify-content:space-between;gap:16px;}
      .logo{height:52px;width:auto;} .tg{font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1d6434;display:block;margin-top:3px;}
      .mc{flex:1;text-align:center;} .mc strong{font-size:17px;font-weight:900;display:block;} .mc span{font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#1d6434;}
      .det{text-align:right;font-size:9.5px;line-height:1.6;color:#3c4540;}
      .s1{height:3px;background:#14723a;margin:5px 0 2px;} .s2{height:2px;background:#d92c32;}
      .svc{font-size:9px;font-style:italic;color:#555f59;border-bottom:1px dashed #555c57;padding:5px 0 6px;line-height:1.6;} .svc p{margin:0;}
      .party{display:grid;grid-template-columns:1.1fr 1fr;gap:14px;margin-top:12px;}
      .cb{border:1px solid #28312c;padding:10px 12px;} .cb .lbl{font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#69736d;margin:0 0 5px;}
      .cr{display:flex;gap:6px;font-size:10.5px;line-height:1.8;} .cr span:first-child{font-weight:800;width:52px;flex-shrink:0;color:#69736d;}
      .ib{border:1px solid #28312c;} .ib h1{margin:0;padding:6px 10px;border-bottom:1px solid #28312c;font-family:Georgia,serif;font-size:16px;text-align:center;text-transform:uppercase;color:#1d2f25;}
      .ib table{width:100%;border-collapse:collapse;} .ib td{padding:3px 8px;font-size:10.5px;border-bottom:1px solid #9ba19d;} .ib td:first-child{font-weight:700;border-right:1px solid #9ba19d;width:42%;}
      table.bom{width:100%;border-collapse:collapse;border:1px solid #28312c;margin-top:14px;font-size:10.5px;}
      table.bom th{background:#173b28;color:#eaf3b5;padding:6px 7px;font-size:9px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;border-right:1px solid rgba(255,255,255,.15);text-align:left;}
      table.bom td{border-bottom:1px solid #e0e5e2;vertical-align:middle;}
      .sigs{display:grid;grid-template-columns:1fr 1fr;gap:50px;margin-top:24px;}
      .sl{display:flex;align-items:center;gap:6px;font-size:10px;} .sl span{white-space:nowrap;} .sl i{flex:1;height:14px;border-bottom:1px dotted #606863;display:block;}
      .sigs strong{font-size:9px;display:block;margin-top:3px;}
      footer{display:flex;justify-content:space-between;align-items:center;margin-top:20px;padding-top:7px;border-top:2px solid #173b28;}
      footer strong{font-size:13px;} footer span{font-size:9px;color:#7a837e;}
    </style></head><body>
    <div class="mh">
      <div><img src="/brand/TCOIN%20LOGO%20OFFICIAL.svg" class="logo" onerror="this.src='/brand/logo.png'"><span class="tg">CENTER OF INNOVATIONS</span></div>
      <div class="mc"><strong>TCOIN Solar Uganda</strong><span>We Plan and Do</span></div>
      <div class="det"><strong>Nabulagala &mdash; near Kasubi Royal Tombs</strong><br>P.O. Box 500273, Kampala, Uganda<br>Tel: 0779 116 709 &middot; 0705 998 786 &middot; 0705 111 123<br>info.tcoinug@gmail.com &middot; www.tcoinug.com</div>
    </div>
    <div class="s1"></div><div class="s2"></div>
    <div class="svc"><p>Solar design, inspection, installation, maintenance and consultancy</p><p>Electrical installations, system design, inspection and maintenance</p><p>Supply of electrical, electronic and solar installation materials</p></div>
    <div class="party">
      <div class="cb"><p class="lbl">Prepared for</p>
        ${[
          ['Client', q.name || '&mdash;'],
          ['District', q.district ? `${q.district}, Uganda` : '&mdash;'],
          ['System', q.system_type ? (SYSTEM_LABEL[q.system_type] ?? q.system_type) : '&mdash;'],
          ['Phone', q.phone || '&mdash;'],
          ['Email', q.email || '&mdash;'],
        ]
          .map(([l, v]) => `<div class="cr"><span>${l}:</span><span>${v}</span></div>`)
          .join('')}
      </div>
      <div class="ib"><h1>Free Quotation</h1><table><tbody>
        <tr><td>Ref.</td><td>${q.ref}</td></tr>
        <tr><td>Date</td><td>${fmtDate(q.created_at)}</td></tr>
        <tr><td>Validity</td><td>30 days from issue</td></tr>
        <tr><td>Prepared by</td><td>TCOIN Solar Uganda</td></tr>
        ${q.sizing ? `<tr><td>System size</td><td>${q.sizing.arrayKwp} kWp &middot; ${q.sizing.panels} panels</td></tr>` : ''}
      </tbody></table></div>
    </div>
    <table class="bom"><thead><tr>
      <th style="width:24px">No.</th><th>Item</th><th>Description / Specification</th>
      <th style="width:34px;text-align:center">Qty</th><th style="width:34px;text-align:center">Unit</th>
      <th style="width:94px;text-align:right">Rate (UGX)</th><th style="width:102px;text-align:right">Amount (UGX)</th>
    </tr></thead><tbody>${rows}${totals}</tbody></table>
    ${q.notes ? `<div style="margin-top:10px;padding:7px 10px;background:#f7f9f7;border:1px solid #e0e5e2;font-size:10.5px"><strong>Notes: </strong>${q.notes}</div>` : ''}
    <div class="sigs">
      <div><div class="sl"><span>Client&apos;s signature &amp; date</span><i></i></div><strong>${q.name || 'Client'}</strong></div>
      <div><div class="sl"><span>Authorised by</span><i></i></div><strong>For and on behalf of TCOIN Solar Uganda</strong></div>
    </div>
    <footer><strong>We Plan and Do . . . .</strong><span>E&amp;OE &middot; All figures are estimates pending site assessment &middot; TCOIN Solar Uganda</span></footer>
    <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};</script>
  </body></html>`);
  win.document.close();
}

function MyQuotesTab({
  isLoading,
  officialQuotes,
}: {
  isLoading: boolean;
  officialQuotes: {
    id: string;
    quote_no: string;
    status: string;
    valid_until?: string;
    version?: { total?: { amount: string; currency: string } };
  }[];
}) {
  const [localQuotes, setLocalQuotes] = useState<SavedQuote[]>(() =>
    loadSavedQuotes().filter((q) => q.source === 'free_request'),
  );

  function remove(id: string) {
    deleteQuote(id);
    setLocalQuotes((qs) => qs.filter((q) => q.id !== id));
  }

  const SYSTEM_LABEL: Record<string, string> = { hybrid: 'Hybrid', on_grid: 'On-Grid', off_grid: 'Off-Grid' };

  const [subTab, setSubTab] = useState<'free' | 'official'>('free');
  const [previewQ, setPreviewQ] = useState<SavedQuote | null>(null);
  const SL: Record<string, string> = {
    hybrid: 'Hybrid (Grid + Battery)',
    on_grid: 'On-Grid (Grid-Tied)',
    off_grid: 'Off-Grid (Battery Only)',
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* ── Sub-tab nav ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '14px 20px',
            background: 'linear-gradient(135deg,#f0f4f1 0%,#e8f0ea 100%)',
            borderBottom: '1px solid #d4ddd6',
          }}
        >
          {(
            [
              ['free', '📄 My Free Quotations', localQuotes.length],
              ['official', '✅ Official Quotes from TCOIN', officialQuotes.length],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              onClick={() => setSubTab(id)}
              style={{
                padding: '9px 22px',
                border:
                  subTab === id ? '1.5px solid rgba(20,114,58,0.35)' : '1.5px solid rgba(160,180,165,0.4)',
                borderRadius: 999,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                background:
                  subTab === id
                    ? 'linear-gradient(135deg,rgba(255,255,255,0.85) 0%,rgba(234,243,181,0.55) 100%)'
                    : 'rgba(255,255,255,0.35)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow:
                  subTab === id
                    ? '0 2px 12px rgba(20,114,58,0.18), inset 0 1px 0 rgba(255,255,255,0.9)'
                    : '0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
                color: subTab === id ? '#14723a' : '#69736d',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.18s ease',
              }}
            >
              {label}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  lineHeight: 1,
                  background: subTab === id ? 'rgba(20,114,58,0.15)' : 'rgba(0,0,0,0.08)',
                  color: subTab === id ? '#14723a' : '#9ba19d',
                  padding: '3px 8px',
                  borderRadius: 999,
                  border: subTab === id ? '1px solid rgba(20,114,58,0.2)' : '1px solid rgba(0,0,0,0.06)',
                }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ── My Free Quotations list ── */}
        {subTab === 'free' && (
          <div style={{ padding: '12px 20px 6px' }}>
            {localQuotes.length === 0 && (
              <div className="pt-empty" style={{ padding: '20px 0' }}>
                <span className="pt-empty-icon">📄</span>
                <p>No free quotations yet</p>
                <span>Use "Get a Free Quotation" to build and save one.</span>
              </div>
            )}

            {localQuotes.length > 0 && (
              <>
                <div
                  className="pt-row pt-row-head"
                  style={{ gridTemplateColumns: '190px 1fr 130px 80px 80px 80px 140px 130px 60px' }}
                >
                  <span>Ref</span>
                  <span>Client</span>
                  <span>Date / Remaining</span>
                  <span style={{ justifyContent: 'center' }}>Hybrid</span>
                  <span style={{ justifyContent: 'center' }}>Array</span>
                  <span style={{ justifyContent: 'center' }}>Inverter</span>
                  <span style={{ justifyContent: 'center' }}>Battery</span>
                  <span style={{ justifyContent: 'center' }}>Print / Download</span>
                  <span style={{ justifyContent: 'center' }}>Del</span>
                </div>
                {localQuotes.map((q) => {
                  const expiry = new Date(q.created_at);
                  expiry.setDate(expiry.getDate() + 30);
                  const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);
                  const s = q.sizing;
                  return (
                    <div
                      key={q.id}
                      className="pt-row"
                      style={{ gridTemplateColumns: '190px 1fr 130px 80px 80px 80px 140px 130px 60px' }}
                    >
                      <button
                        onClick={() => setPreviewQ(q)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: 11,
                          color: '#14723a',
                          fontFamily: 'monospace',
                          textDecoration: 'underline',
                          textDecorationStyle: 'dotted',
                          textAlign: 'left',
                        }}
                      >
                        {q.ref}
                      </button>
                      <span style={{ fontSize: 11 }}>
                        <span style={{ fontWeight: 600 }}>{q.name || '—'}</span>
                        {q.district && (
                          <span style={{ color: '#69736d', fontSize: 10 }}> · {q.district}</span>
                        )}
                      </span>
                      <span
                        style={{ fontSize: 11, flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}
                      >
                        <span style={{ color: '#69736d' }}>{fmtDate(q.created_at)}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: daysLeft <= 0 ? '#d92c32' : daysLeft <= 7 ? '#c47a00' : '#14723a',
                          }}
                        >
                          {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
                        </span>
                      </span>
                      <span style={{ justifyContent: 'center', fontSize: 11 }}>
                        {q.system_type ? (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color:
                                q.system_type === 'hybrid'
                                  ? '#3B3A93'
                                  : q.system_type === 'on_grid'
                                    ? '#14723a'
                                    : '#5A3114',
                              background:
                                q.system_type === 'hybrid'
                                  ? '#eeeef9'
                                  : q.system_type === 'on_grid'
                                    ? '#eaf3b5'
                                    : '#f5ede6',
                              padding: '2px 7px',
                              borderRadius: 999,
                            }}
                          >
                            {SYSTEM_LABEL[q.system_type] ?? q.system_type}
                          </span>
                        ) : (
                          <span style={{ color: '#9ba19d' }}>—</span>
                        )}
                      </span>
                      <span
                        style={{ justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#1d2f25' }}
                      >
                        {s ? `${s.arrayKwp} kWp` : <span style={{ color: '#9ba19d' }}>—</span>}
                      </span>
                      <span
                        style={{ justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#1d2f25' }}
                      >
                        {s ? `${s.inverterKw} kW` : <span style={{ color: '#9ba19d' }}>—</span>}
                      </span>
                      <span
                        style={{ justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#1d2f25' }}
                      >
                        {s && s.batteryKwh > 0 ? (
                          `${s.batteryKwh} kWh`
                        ) : (
                          <span style={{ color: '#9ba19d' }}>—</span>
                        )}
                      </span>
                      <span style={{ justifyContent: 'center' }}>
                        <button className="pt-btn-secondary pt-btn-sm" onClick={() => printFreeQuote(q)}>
                          🖨 Print
                        </button>
                      </span>
                      <span style={{ justifyContent: 'center' }}>
                        <button
                          onClick={() => remove(q.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#d92c32',
                            fontSize: 16,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ── Official Quotes from TCOIN list ── */}
        {subTab === 'official' && (
          <div style={{ padding: '12px 20px 6px' }}>
            {isLoading && (
              <div style={{ padding: 24 }}>
                <LoadingState />
              </div>
            )}

            {!isLoading && officialQuotes.length === 0 && (
              <div className="pt-empty" style={{ padding: '20px 0' }}>
                <span className="pt-empty-icon">✅</span>
                <p>No official quotes yet</p>
                <span>Submit a free quotation request and TCOIN will send you a formal quote.</span>
              </div>
            )}

            {!isLoading && officialQuotes.length > 0 && (
              <>
                <div
                  className="pt-row pt-row-head"
                  style={{ gridTemplateColumns: '150px 130px 160px 110px 80px' }}
                >
                  <span>Quote No.</span>
                  <span>Valid Until</span>
                  <span style={{ justifyContent: 'flex-end' }}>Amount</span>
                  <span style={{ justifyContent: 'center' }}>Status</span>
                  <span style={{ justifyContent: 'center' }}>Open</span>
                </div>
                {officialQuotes.map((q) => (
                  <div
                    key={q.id}
                    className="pt-row"
                    style={{ gridTemplateColumns: '150px 130px 160px 110px 80px' }}
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
                    <span style={{ fontWeight: 700, fontSize: 12, justifyContent: 'flex-end' }}>
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
                    {officialQuotes.length} quote{officialQuotes.length !== 1 ? 's' : ''} on record
                  </span>
                  <span>E&amp;OE &middot; Prices subject to site survey confirmation.</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {previewQ && (
        <div
          onClick={() => setPreviewQ(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(10,20,12,0.55)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '32px 16px',
            overflowY: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: 820,
              borderRadius: 4,
              boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
              overflow: 'hidden',
              marginBottom: 32,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                background: '#173b28',
                color: '#eaf3b5',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '0.04em' }}>{previewQ.ref}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => printFreeQuote(previewQ)}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#eaf3b5',
                    borderRadius: 4,
                    padding: '5px 14px',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  🖨 Print / Download
                </button>
                <button
                  onClick={() => setPreviewQ(null)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#eaf3b5',
                    borderRadius: 4,
                    padding: '5px 12px',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div
              style={{
                padding: '28px 32px',
                fontFamily: 'DM Sans,Arial,sans-serif',
                fontSize: 11,
                color: '#18201b',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
              >
                <div>
                  <img
                    src="/brand/TCOIN LOGO OFFICIAL.svg"
                    style={{ height: 52 }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#1d6434',
                      display: 'block',
                      marginTop: 3,
                    }}
                  >
                    CENTER OF INNOVATIONS
                  </span>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <strong style={{ fontSize: 17, fontWeight: 900, display: 'block' }}>
                    TCOIN Solar Uganda
                  </strong>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#1d6434',
                    }}
                  >
                    We Plan and Do
                  </span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '9.5px', lineHeight: 1.6, color: '#3c4540' }}>
                  <strong>Nabulagala — near Kasubi Royal Tombs</strong>
                  <br />
                  P.O. Box 500273, Kampala, Uganda
                  <br />
                  Tel: 0779 116 709 · 0705 998 786 · 0705 111 123
                  <br />
                  info.tcoinug@gmail.com · www.tcoinug.com
                </div>
              </div>
              <div style={{ height: 3, background: '#14723a', margin: '5px 0 2px' }} />
              <div style={{ height: 2, background: '#d92c32' }} />
              <div
                style={{
                  fontSize: 9,
                  fontStyle: 'italic',
                  color: '#555f59',
                  borderBottom: '1px dashed #555c57',
                  padding: '5px 0 6px',
                  lineHeight: 1.6,
                }}
              >
                Solar design, inspection, installation, maintenance and consultancy &nbsp;·&nbsp; Electrical
                installations, system design, inspection and maintenance &nbsp;·&nbsp; Supply of electrical,
                electronic and solar installation materials
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 14, marginTop: 12 }}>
                <div style={{ border: '1px solid #28312c', padding: '10px 12px' }}>
                  <p
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#69736d',
                      margin: '0 0 5px',
                    }}
                  >
                    Prepared for
                  </p>
                  {(['Client', 'District', 'System', 'Phone', 'Email'] as const).map((lbl, i) => {
                    const vals = [
                      previewQ.name || '—',
                      previewQ.district ? `${previewQ.district}, Uganda` : '—',
                      previewQ.system_type ? (SL[previewQ.system_type] ?? previewQ.system_type) : '—',
                      previewQ.phone || '—',
                      previewQ.email || '—',
                    ];
                    return (
                      <div key={lbl} style={{ display: 'flex', gap: 6, fontSize: '10.5px', lineHeight: 1.8 }}>
                        <span style={{ fontWeight: 800, width: 52, flexShrink: 0, color: '#69736d' }}>
                          {lbl}:
                        </span>
                        <span>{vals[i]}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ border: '1px solid #28312c' }}>
                  <h1
                    style={{
                      margin: 0,
                      padding: '6px 10px',
                      borderBottom: '1px solid #28312c',
                      fontFamily: 'Georgia,serif',
                      fontSize: 16,
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      color: '#1d2f25',
                    }}
                  >
                    Free Quotation
                  </h1>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {[
                        ['Ref.', previewQ.ref],
                        ['Date', fmtDate(previewQ.created_at)],
                        ['Validity', '30 days from issue'],
                        ['Prepared by', 'TCOIN Solar Uganda'],
                        ...(previewQ.sizing
                          ? [
                              [
                                'System size',
                                `${previewQ.sizing.arrayKwp} kWp · ${previewQ.sizing.panels} panels`,
                              ],
                            ]
                          : []),
                      ].map(([l, v]) => (
                        <tr key={l}>
                          <td
                            style={{
                              padding: '3px 8px',
                              fontSize: '10.5px',
                              borderBottom: '1px solid #9ba19d',
                              fontWeight: 700,
                              borderRight: '1px solid #9ba19d',
                              width: '42%',
                            }}
                          >
                            {l}
                          </td>
                          <td
                            style={{
                              padding: '3px 8px',
                              fontSize: '10.5px',
                              borderBottom: '1px solid #9ba19d',
                            }}
                          >
                            {v}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid #28312c',
                  marginTop: 14,
                  fontSize: '10.5px',
                }}
              >
                <thead>
                  <tr style={{ background: '#173b28' }}>
                    {[
                      'No.',
                      'Item',
                      'Description / Specification',
                      'Qty',
                      'Unit',
                      'Rate (UGX)',
                      'Amount (UGX)',
                    ].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          color: '#eaf3b5',
                          padding: '6px 7px',
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          borderRight: '1px solid rgba(255,255,255,.15)',
                          textAlign: i >= 3 ? 'center' : 'left',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(previewQ.lines ?? []).map((l, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f7f9f7' }}>
                      <td
                        style={{
                          textAlign: 'center',
                          color: '#9ba19d',
                          fontSize: 10,
                          fontWeight: 700,
                          borderRight: '1px solid #e0e5e2',
                          padding: '5px 4px',
                          borderBottom: '1px solid #e0e5e2',
                        }}
                      >
                        {i + 1}
                      </td>
                      <td
                        style={{
                          borderRight: '1px solid #e0e5e2',
                          padding: '5px 7px',
                          fontWeight: 700,
                          verticalAlign: 'top',
                          borderBottom: '1px solid #e0e5e2',
                        }}
                      >
                        {l.particulars}
                      </td>
                      <td
                        style={{
                          borderRight: '1px solid #e0e5e2',
                          padding: '5px 7px',
                          color: '#555f59',
                          fontSize: 10,
                          lineHeight: 1.5,
                          verticalAlign: 'top',
                          borderBottom: '1px solid #e0e5e2',
                        }}
                      >
                        {l.spec || '—'}
                      </td>
                      <td
                        style={{
                          borderRight: '1px solid #e0e5e2',
                          padding: '5px 7px',
                          textAlign: 'center',
                          fontWeight: 600,
                          borderBottom: '1px solid #e0e5e2',
                        }}
                      >
                        {l.qty}
                      </td>
                      <td
                        style={{
                          borderRight: '1px solid #e0e5e2',
                          padding: '5px 7px',
                          textAlign: 'center',
                          color: '#69736d',
                          borderBottom: '1px solid #e0e5e2',
                        }}
                      >
                        {l.unit}
                      </td>
                      <td
                        style={{
                          borderRight: '1px solid #e0e5e2',
                          padding: '5px 7px',
                          textAlign: 'right',
                          borderBottom: '1px solid #e0e5e2',
                        }}
                      >
                        {l.rate > 0 ? Number(l.rate).toLocaleString('en-UG') : '—'}
                      </td>
                      <td
                        style={{
                          padding: '5px 7px',
                          textAlign: 'right',
                          fontWeight: 700,
                          borderBottom: '1px solid #e0e5e2',
                        }}
                      >
                        {l.amount > 0 ? Number(l.amount).toLocaleString('en-UG') : '—'}
                      </td>
                    </tr>
                  ))}
                  {[
                    { label: 'Subtotal', val: previewQ.subtotal ?? 0, bold: false },
                    { label: 'VAT (18%)', val: previewQ.vat ?? 0, bold: false },
                    { label: 'TOTAL', val: previewQ.total ?? 0, bold: true },
                  ].map(({ label, val, bold }) => (
                    <tr key={label} style={{ background: bold ? '#173b28' : '#fff' }}>
                      <td colSpan={5} />
                      <td
                        style={{
                          padding: '6px 10px',
                          textAlign: 'right',
                          fontSize: bold ? 12 : 11,
                          fontWeight: bold ? 900 : 400,
                          color: bold ? '#eaf3b5' : '#69736d',
                          borderTop: bold ? '2px solid #173b28' : '1px solid #e0e5e2',
                          borderRight: '1px solid rgba(255,255,255,.15)',
                        }}
                      >
                        {label}
                      </td>
                      <td
                        style={{
                          padding: '6px 10px',
                          textAlign: 'right',
                          fontSize: bold ? 12 : 11,
                          fontWeight: bold ? 900 : 400,
                          color: bold ? '#eaf3b5' : '#69736d',
                          borderTop: bold ? '2px solid #173b28' : '1px solid #e0e5e2',
                        }}
                      >
                        UGX {Number(val).toLocaleString('en-UG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewQ.notes && (
                <div
                  style={{
                    marginTop: 10,
                    padding: '7px 10px',
                    background: '#f7f9f7',
                    border: '1px solid #e0e5e2',
                    fontSize: '10.5px',
                  }}
                >
                  <strong>Notes: </strong>
                  {previewQ.notes}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, marginTop: 24 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                    <span style={{ whiteSpace: 'nowrap' }}>Client's signature &amp; date</span>
                    <i
                      style={{ flex: 1, height: 14, borderBottom: '1px dotted #606863', display: 'block' }}
                    />
                  </div>
                  <strong style={{ fontSize: 9, display: 'block', marginTop: 3 }}>
                    {previewQ.name || 'Client'}
                  </strong>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                    <span style={{ whiteSpace: 'nowrap' }}>Authorised by</span>
                    <i
                      style={{ flex: 1, height: 14, borderBottom: '1px dotted #606863', display: 'block' }}
                    />
                  </div>
                  <strong style={{ fontSize: 9, display: 'block', marginTop: 3 }}>
                    For and on behalf of TCOIN Solar Uganda
                  </strong>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 20,
                  paddingTop: 7,
                  borderTop: '2px solid #173b28',
                }}
              >
                <strong style={{ fontSize: 13 }}>We Plan and Do . . . .</strong>
                <span style={{ fontSize: 9, color: '#7a837e' }}>
                  E&amp;OE · All figures are estimates pending site assessment · TCOIN Solar Uganda
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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

  // Derive effective prefill: explicit > sizingOutput > selectedSaved
  const effectivePrefill: QuotationPrefill | undefined =
    quotePrefill ??
    (sizingOutput
      ? {
          result: sizingOutput.result,
          appliances: sizingOutput.appliances,
          district: sizingOutput.district,
          systemType: sizingOutput.systemType,
          clientName: sizingOutput.clientName,
        }
      : selectedSaved?.sizing
        ? {
            result: selectedSaved.sizing,
            appliances: selectedSaved.appliances ?? [],
            district: selectedSaved.district ?? '',
            systemType: selectedSaved.system_type!,
            clientName: selectedSaved.name,
          }
        : undefined);

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
          key={
            effectivePrefill ? `pf-${effectivePrefill.result.dailyWh}-${effectivePrefill.district}` : 'empty'
          }
          prefill={effectivePrefill}
          onSaved={() => setQuotePrefill(null)}
        />
      )}

      {/* ── My Quotes ── */}
      {tab === 'official' && <MyQuotesTab isLoading={isLoading} officialQuotes={quotes} />}
    </div>
  );
}
