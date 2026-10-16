import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, withIdempotency } from '@/api/client';
import type { IndicativeResult } from '@/sizing';
import type { Appliance, SystemType } from '@/sizing/types';
import { saveQuote, nextRef } from '../savedQuotes';
import '../portal.css';

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

export interface QuotationPrefill {
  result: IndicativeResult;
  appliances: Appliance[];
  district: string;
  systemType: SystemType;
  clientName?: string;
}

interface DraftLine {
  id: string;
  particulars: string;
  spec: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  fromCatalog: boolean;
  variantId?: string;
}

type Product = {
  id: string;
  name: string;
  product_type: string;
  spec_text?: string;
  variants: { id: string; sku: string; name: string; unit: string; price: { amount: string } }[];
};

function buildDraftLines(result: IndicativeResult, products: Product[]): DraftLine[] {
  const panels = products.filter((p) => p.product_type === 'panel');
  const inverters = products.filter((p) => p.product_type === 'inverter');
  const batteries = products.filter((p) => p.product_type === 'battery');

  // Pick best-fit products by wattage / capacity
  const panelProduct = panels[0] ?? null;
  const inverterProduct = inverters[0] ?? null;
  const batteryProduct = batteries[0] ?? null;

  const panelVariant = panelProduct?.variants[0] ?? null;
  const inverterVariant = inverterProduct?.variants[0] ?? null;
  const batteryVariant = batteryProduct?.variants[0] ?? null;

  const panelRate = panelVariant
    ? Number(panelVariant.price.amount)
    : Math.round(
        (((result.priceLow + result.priceHigh) / 2) * (result.batteryKwh > 0 ? 0.5 : 0.65)) / result.panels,
      );
  const inverterRate = inverterVariant
    ? Number(inverterVariant.price.amount)
    : Math.round(((result.priceLow + result.priceHigh) / 2) * (result.batteryKwh > 0 ? 0.25 : 0.35));
  const batteryRate = batteryVariant
    ? Number(batteryVariant.price.amount)
    : result.batteryKwh > 0
      ? Math.round((((result.priceLow + result.priceHigh) / 2) * 0.25) / result.batteryKwh)
      : 0;

  const lines: DraftLine[] = [
    {
      id: 'l-panels',
      fromCatalog: !!panelVariant,
      variantId: panelVariant?.id,
      particulars: panelProduct?.name ?? 'Solar PV Panels',
      spec:
        panelProduct?.spec_text ??
        `${Math.round((result.arrayKwp * 1000) / result.panels)} W monocrystalline, ${result.arrayKwp} kWp total`,
      qty: result.panels,
      unit: panelVariant?.unit ?? 'pcs',
      rate: panelRate,
      amount: panelRate * result.panels,
    },
    {
      id: 'l-inverter',
      fromCatalog: !!inverterVariant,
      variantId: inverterVariant?.id,
      particulars: inverterProduct?.name ?? 'Solar Inverter',
      spec:
        inverterProduct?.spec_text ??
        `${result.inverterKw} kW, ${result.inverterKw >= 5 ? '3-phase' : 'single-phase'}`,
      qty: 1,
      unit: inverterVariant?.unit ?? 'set',
      rate: inverterRate,
      amount: inverterRate,
    },
  ];

  if (result.batteryKwh > 0) {
    lines.push({
      id: 'l-battery',
      fromCatalog: !!batteryVariant,
      variantId: batteryVariant?.id,
      particulars: batteryProduct?.name ?? 'Battery Bank',
      spec: batteryProduct?.spec_text ?? `LiFePO4, ${result.batteryKwh} kWh total`,
      qty: result.batteryKwh,
      unit: batteryVariant?.unit ?? 'kWh',
      rate: batteryRate,
      amount: batteryRate * result.batteryKwh,
    });
  }

  lines.push(
    {
      id: 'l-mount',
      fromCatalog: false,
      particulars: 'Mounting Structure',
      spec: 'Roof / ground mount, galvanised steel',
      qty: 1,
      unit: 'set',
      rate: 0,
      amount: 0,
    },
    {
      id: 'l-cable',
      fromCatalog: false,
      particulars: 'DC & AC Cabling',
      spec: 'Solar cable, conduit, MC4 connectors',
      qty: 1,
      unit: 'lot',
      rate: 0,
      amount: 0,
    },
    {
      id: 'l-protect',
      fromCatalog: false,
      particulars: 'Protection & Earthing',
      spec: 'DC/AC SPD, isolators, earth rod',
      qty: 1,
      unit: 'lot',
      rate: 0,
      amount: 0,
    },
    {
      id: 'l-install',
      fromCatalog: false,
      particulars: 'Installation & Commissioning',
      spec: 'Labour, transport, site survey',
      qty: 1,
      unit: 'lot',
      rate: 0,
      amount: 0,
    },
  );

  return lines;
}

/* ── Product picker modal ── */
function ProductPicker({
  role,
  products,
  onPick,
  onClose,
}: {
  role: string;
  products: Product[];
  onPick: (p: Product) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '2px solid #173b28',
          width: 520,
          maxWidth: '95vw',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #e0e5e2',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: '#1d2f25',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Pick {role} from catalog
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#69736d' }}
          >
            ×
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {products.length === 0 && (
            <div className="pt-empty">
              <p>No products found</p>
            </div>
          )}
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid #e0e5e2',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1d2f25' }}>{p.name}</div>
                {p.spec_text && (
                  <div style={{ fontSize: 11, color: '#69736d', marginTop: 2 }}>{p.spec_text}</div>
                )}
                {p.variants[0] && (
                  <div style={{ fontSize: 11, color: '#14723a', fontWeight: 700, marginTop: 3 }}>
                    UGX {fmt(p.variants[0].price.amount)} / {p.variants[0].unit}
                  </div>
                )}
              </div>
              <button
                className="pt-btn-primary pt-btn-sm"
                onClick={() => {
                  onPick(p);
                  onClose();
                }}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export function FreeQuotation({ prefill, onSaved }: { prefill?: QuotationPrefill; onSaved?: () => void }) {
  const [name, setName] = useState(prefill?.clientName?.trim() ?? '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [picker, setPicker] = useState<{ role: string; type: string; lineId: string } | null>(null);

  const { data: productsData } = useQuery({
    queryKey: ['catalog-products-all'],
    queryFn: () => api.get('/catalog/products').then((r) => r.data.data ?? []),
    staleTime: 300_000,
  });
  const allProducts: Product[] = productsData ?? [];

  // Build initial lines from prefill or empty
  const [lines, setLines] = useState<DraftLine[]>(() =>
    prefill ? buildDraftLines(prefill.result, allProducts) : [],
  );

  // Rebuild lines when products load (if prefill was set before products arrived)
  const [builtFromCatalog, setBuiltFromCatalog] = useState(false);
  if (prefill && allProducts.length > 0 && !builtFromCatalog) {
    setLines(buildDraftLines(prefill.result, allProducts));
    setBuiltFromCatalog(true);
  }

  function addBlankLine() {
    setLines((ls) => [
      ...ls,
      {
        id: `l-${Date.now()}`,
        fromCatalog: false,
        particulars: '',
        spec: '',
        qty: 1,
        unit: 'pc',
        rate: 0,
        amount: 0,
      },
    ]);
  }

  function updateLine(id: string, k: keyof DraftLine, v: string | number | boolean) {
    setLines((ls) =>
      ls.map((l) => {
        if (l.id !== id) return l;
        const updated = { ...l, [k]: v };
        if (k === 'qty' || k === 'rate') updated.amount = Number(updated.qty) * Number(updated.rate);
        return updated;
      }),
    );
  }

  function swapFromCatalog(lineId: string, product: Product) {
    const v = product.variants[0];
    setLines((ls) =>
      ls.map((l) =>
        l.id !== lineId
          ? l
          : {
              ...l,
              fromCatalog: true,
              variantId: v?.id,
              particulars: product.name,
              spec: product.spec_text ?? '',
              unit: v?.unit ?? l.unit,
              rate: v ? Number(v.price.amount) : l.rate,
              amount: v ? Number(v.price.amount) * l.qty : l.amount,
            },
      ),
    );
  }

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const vat = Math.round(subtotal * 0.18);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = {
        source: 'portal_free_quote',
        name,
        email,
        phone,
        notes,
        ...(prefill
          ? {
              district: prefill.district,
              system_type: prefill.systemType,
              sizing: {
                daily_wh: prefill.result.dailyWh,
                array_kwp: prefill.result.arrayKwp,
                panels: prefill.result.panels,
                battery_kwh: prefill.result.batteryKwh,
                inverter_kw: prefill.result.inverterKw,
                price_low: prefill.result.priceLow,
                price_high: prefill.result.priceHigh,
              },
              appliances: prefill.appliances,
            }
          : {}),
        lines: lines.map(({ particulars, spec, qty, unit, rate, amount, variantId }) => ({
          particulars,
          spec,
          qty,
          unit,
          rate,
          amount,
          variant_id: variantId,
        })),
      };
      await api.post('/leads', payload, withIdempotency());
      saveQuote({
        id: `sq-${Date.now()}`,
        ref: nextRef(),
        created_at: new Date().toISOString(),
        source: 'free_request',
        name,
        email,
        phone,
        notes,
        ...(prefill
          ? {
              district: prefill.district,
              system_type: prefill.systemType,
              system_type_label: prefill.systemType,
              appliances: prefill.appliances,
              sizing: prefill.result,
            }
          : { system_type_label: 'custom' }),
        lines: lines.map(({ particulars, spec, qty, unit, rate, amount }) => ({
          particulars,
          spec,
          qty,
          unit,
          rate,
          amount,
        })),
        subtotal,
        vat,
        total: subtotal + vat,
      });
      setSubmitted(true);
      onSaved?.();
    } catch {
      setError('Could not submit. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48 }}>✅</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#1d2f25', fontFamily: 'Georgia,serif' }}>
          Quotation request sent!
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#69736d', maxWidth: 400 }}>
          Our team will review your details and send a formal quotation to <strong>{email}</strong> within 24
          hours.
        </p>
        <button
          className="pt-btn-secondary"
          onClick={() => {
            setSubmitted(false);
            setLines(prefill ? buildDraftLines(prefill.result, allProducts) : []);
          }}
        >
          New request
        </button>
      </div>
    );
  }

  return (
    <>
      {picker && (
        <ProductPicker
          role={picker.role}
          products={allProducts.filter((p) => p.product_type === picker.type)}
          onPick={(p) => swapFromCatalog(picker.lineId, p)}
          onClose={() => setPicker(null)}
        />
      )}

      <form onSubmit={submit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Context banner if coming from sizing */}
        {prefill && (
          <div
            style={{
              background: '#f0faf4',
              border: '1px solid #14723a',
              padding: '12px 16px',
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 12, color: '#14723a', fontWeight: 800 }}>Based on your sizing:</span>
            {[
              `${prefill.result.arrayKwp} kWp array`,
              `${prefill.result.panels} panels`,
              prefill.result.batteryKwh > 0 ? `${prefill.result.batteryKwh} kWh battery` : null,
              `${prefill.result.inverterKw} kW inverter`,
              prefill.district,
            ]
              .filter(Boolean)
              .map((v) => (
                <span
                  key={v}
                  style={{
                    fontSize: 11,
                    background: '#fff',
                    border: '1px solid #14723a',
                    padding: '2px 8px',
                    color: '#1d2f25',
                  }}
                >
                  {v}
                </span>
              ))}
          </div>
        )}

        {/* Contact details */}
        <div>
          <p className="pt-label" style={{ marginBottom: 10 }}>
            Your contact details
          </p>
          <div className="pt-grid-2" style={{ maxWidth: 560 }}>
            <div className="pt-field">
              <label className="pt-label">Full name *</label>
              <input
                className="pt-input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="pt-field">
              <label className="pt-label">Email *</label>
              <input
                className="pt-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="pt-field">
              <label className="pt-label">Phone</label>
              <input
                className="pt-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 700 000 000"
              />
            </div>
            <div className="pt-field" style={{ gridColumn: '1 / -1' }}>
              <label className="pt-label">Notes</label>
              <textarea
                className="pt-textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Site address, special requirements…"
              />
            </div>
          </div>
        </div>

        {/* Quote lines */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <p className="pt-label" style={{ margin: 0 }}>
              Quote lines
            </p>
            <button type="button" className="pt-btn-secondary pt-btn-sm" onClick={addBlankLine}>
              + Add line
            </button>
          </div>

          <div style={{ border: '1px solid #28312c' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 180px 60px 52px 120px 120px 80px 36px',
                background: '#f1f4f1',
                borderBottom: '1px solid #28312c',
              }}
            >
              {['Item', 'Specification', 'Qty', 'Unit', 'Rate (UGX)', 'Amount (UGX)', 'Source', ''].map(
                (h) => (
                  <div
                    key={h}
                    style={{
                      padding: '6px 10px',
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#293269',
                      borderRight: '1px solid #e0e5e2',
                    }}
                  >
                    {h}
                  </div>
                ),
              )}
            </div>

            {lines.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: '#9ba19d' }}>
                No lines yet — click "+ Add line" or come from "Size a System".
              </div>
            )}

            {lines.map((l) => {
              const productType =
                l.id === 'l-panels'
                  ? 'panel'
                  : l.id === 'l-inverter'
                    ? 'inverter'
                    : l.id === 'l-battery'
                      ? 'battery'
                      : '';
              return (
                <div
                  key={l.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 180px 60px 52px 120px 120px 80px 36px',
                    borderBottom: '1px solid #e0e5e2',
                    background: l.fromCatalog ? '#f7faf7' : '#fff',
                  }}
                >
                  <div style={{ padding: '4px 6px', borderRight: '1px solid #e0e5e2' }}>
                    <input
                      className="pt-input"
                      style={{ height: 32, fontSize: 12, width: '100%' }}
                      value={l.particulars}
                      placeholder="Item name"
                      onChange={(e) => updateLine(l.id, 'particulars', e.target.value)}
                    />
                  </div>
                  <div style={{ padding: '4px 6px', borderRight: '1px solid #e0e5e2' }}>
                    <input
                      className="pt-input"
                      style={{ height: 32, fontSize: 11, width: '100%' }}
                      value={l.spec}
                      placeholder="Specification"
                      onChange={(e) => updateLine(l.id, 'spec', e.target.value)}
                    />
                  </div>
                  <div style={{ padding: '4px 6px', borderRight: '1px solid #e0e5e2' }}>
                    <input
                      className="pt-input"
                      style={{ height: 32, fontSize: 12, width: '100%' }}
                      type="number"
                      min="0"
                      value={l.qty}
                      onChange={(e) => updateLine(l.id, 'qty', Number(e.target.value))}
                    />
                  </div>
                  <div style={{ padding: '4px 6px', borderRight: '1px solid #e0e5e2' }}>
                    <input
                      className="pt-input"
                      style={{ height: 32, fontSize: 12, width: '100%' }}
                      value={l.unit}
                      onChange={(e) => updateLine(l.id, 'unit', e.target.value)}
                    />
                  </div>
                  <div style={{ padding: '4px 6px', borderRight: '1px solid #e0e5e2' }}>
                    <input
                      className="pt-input"
                      style={{ height: 32, fontSize: 12, width: '100%', textAlign: 'right' }}
                      type="number"
                      min="0"
                      value={l.rate}
                      onChange={(e) => updateLine(l.id, 'rate', Number(e.target.value))}
                    />
                  </div>
                  <div
                    style={{
                      padding: '8px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#1d2f25',
                      borderRight: '1px solid #e0e5e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    {l.amount > 0 ? fmt(l.amount) : '—'}
                  </div>
                  <div
                    style={{
                      padding: '4px 6px',
                      borderRight: '1px solid #e0e5e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {productType ? (
                      <button
                        type="button"
                        onClick={() => setPicker({ role: productType, type: productType, lineId: l.id })}
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '3px 6px',
                          border: `1px solid ${l.fromCatalog ? '#14723a' : '#9ba19d'}`,
                          background: l.fromCatalog ? '#eaf3b5' : '#f1f4f1',
                          color: l.fromCatalog ? '#14723a' : '#69736d',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                        title="Pick from catalog"
                      >
                        {l.fromCatalog ? '✓ Catalog' : 'Pick →'}
                      </button>
                    ) : (
                      <span style={{ fontSize: 10, color: '#9ba19d' }}>Manual</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#d92c32',
                        fontSize: 16,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Totals */}
            {lines.length > 0 && (
              <>
                {[
                  { label: 'Subtotal', val: subtotal, bold: false },
                  { label: 'VAT (18%)', val: vat, bold: false },
                  { label: 'Total', val: subtotal + vat, bold: true },
                ].map(({ label, val, bold }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      borderTop: bold ? '2px solid #173b28' : '1px solid #e0e5e2',
                      background: bold ? '#f1f4f1' : '#fff',
                    }}
                  >
                    <div
                      style={{
                        width: 240,
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        fontSize: bold ? 13 : 12,
                        fontWeight: bold ? 900 : 400,
                        color: bold ? '#1d2f25' : '#69736d',
                      }}
                    >
                      <span>{label}</span>
                      <span>UGX {fmt(val)}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="pt-alert pt-alert-red" style={{ margin: 0 }}>
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="pt-btn-primary" disabled={busy}>
            {busy ? 'Sending…' : 'Submit quotation request →'}
          </button>
        </div>
      </form>
    </>
  );
}
