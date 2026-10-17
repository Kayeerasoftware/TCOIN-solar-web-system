import { useState } from 'react';
import { DISTRICTS } from '@/config/districts';
import type { Appliance, SystemType } from '@/sizing';
import { PRESET_APPLIANCES, runEstimate } from '@/features/calculator';
import type { IndicativeResult } from '@/sizing';

export interface SizingOutput {
  result: IndicativeResult;
  appliances: Appliance[];
  district: string;
  systemType: SystemType;
  clientName?: string;
  bill?: string;
  mode: 'bill' | 'appliances';
}

export interface SizingInitialValues {
  mode: 'bill' | 'appliances';
  bill?: string;
  appliances?: Appliance[];
  district?: string;
  systemType?: SystemType;
  clientName?: string;
}

const blank = (): Appliance => ({ name: '', watts: 0, quantity: 1, hoursPerDay: 1 });

function formatBill(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-UG');
}

function parseBill(formatted: string): number {
  return Number(formatted.replace(/,/g, ''));
}

export function SizeASystem({
  onResult,
  initialValues,
}: {
  onResult: (o: SizingOutput) => void;
  initialValues?: SizingInitialValues;
}) {
  const [mode, setMode] = useState<'bill' | 'appliances'>(initialValues?.mode ?? 'bill');
  const [bill, setBill] = useState(formatBill(initialValues?.bill ?? ''));
  const [appliances, setAppliances] = useState<Appliance[]>(initialValues?.appliances ?? [blank()]);
  const [district, setDistrict] = useState(initialValues?.district ?? 'Kampala');
  const [systemType, setSystemType] = useState<SystemType>(initialValues?.systemType ?? 'hybrid');
  const [clientName, setClientName] = useState(initialValues?.clientName ?? '');
  const [error, setError] = useState('');

  const update = (i: number, patch: Partial<Appliance>) =>
    setAppliances((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const remove = (i: number) => setAppliances((rows) => rows.filter((_, j) => j !== i));

  function submit() {
    const valid = appliances.filter(
      (a) => a.name.trim() && a.watts > 0 && a.quantity > 0 && a.hoursPerDay > 0,
    );
    const billNum = parseBill(bill);
    if (mode === 'bill' && !(billNum > 0)) return setError('Enter your monthly electricity bill.');
    if (mode === 'appliances' && !valid.length)
      return setError('Add at least one appliance with its watts and hours.');
    setError('');
    try {
      const result = runEstimate({
        mode,
        monthlyBill: billNum || undefined,
        appliances: valid,
        district,
        systemType,
      });
      onResult({ result, appliances: valid, district, systemType, clientName, bill, mode });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Calculation failed.');
    }
  }

  return (
    <div className="cs-doc" style={{ width: '100%', boxShadow: 'none', borderTop: 'none' }}>
      <div className="cs-hero">
        <h1>TCOIN Solar System Calculator</h1>
        <p>Get a free solar system estimate — size your system before requesting a quotation.</p>
      </div>

      <div className="cs-body">
        {/* Step 1 — Energy use */}
        <div className="cs-section">
          <div className="cs-section-head">
            <span className="cs-step-badge">1</span>
            <h2>Your energy use</h2>
          </div>
          <div className="cs-section-body">
            <div className="cs-mode-toggle">
              <button
                className={`cs-mode-btn${mode === 'bill' ? ' active' : ''}`}
                type="button"
                onClick={() => setMode('bill')}
              >
                Monthly bill
                <span className="cs-mode-sub">Use your electricity bill to estimate the system</span>
              </button>
              <button
                className={`cs-mode-btn${mode === 'appliances' ? ' active' : ''}`}
                type="button"
                onClick={() => setMode('appliances')}
              >
                Appliance list
                <span className="cs-mode-sub">List your appliances to calculate the system</span>
              </button>
            </div>

            {mode === 'bill' ? (
              <div className="cs-field">
                <label className="cs-label" htmlFor="bill">
                  Monthly electricity bill (UGX)
                </label>
                <input
                  id="bill"
                  className="cs-input"
                  inputMode="numeric"
                  placeholder="e.g. 150,000"
                  value={bill}
                  onChange={(e) => setBill(formatBill(e.target.value))}
                />
              </div>
            ) : (
              <>
                <div className="cs-presets">
                  {PRESET_APPLIANCES.map((p) => (
                    <button
                      key={p.name}
                      className="cs-preset-btn"
                      type="button"
                      onClick={() =>
                        setAppliances((rows) => [...rows.filter((r) => r.name || r.watts), { ...p }])
                      }
                    >
                      + {p.name}
                    </button>
                  ))}
                </div>
                <div className="cs-appliance-table">
                  <div className="cs-appliance-header">
                    <span>Appliance</span>
                    <span>Watts</span>
                    <span>Qty</span>
                    <span>Hrs / day</span>
                    <span />
                  </div>
                  {appliances.map((a, i) => (
                    <div className="cs-appliance-row" key={i}>
                      <input
                        className="cs-input"
                        placeholder="Name"
                        value={a.name}
                        onChange={(e) => update(i, { name: e.target.value })}
                      />
                      <input
                        className="cs-input"
                        type="number"
                        min={0}
                        placeholder="Watts"
                        value={a.watts || ''}
                        onChange={(e) => update(i, { watts: Number(e.target.value) })}
                      />
                      <input
                        className="cs-input"
                        type="number"
                        min={1}
                        placeholder="Qty"
                        value={a.quantity}
                        onChange={(e) => update(i, { quantity: Number(e.target.value) })}
                      />
                      <input
                        className="cs-input"
                        type="number"
                        min={0}
                        max={24}
                        step="0.5"
                        placeholder="Hrs"
                        value={a.hoursPerDay}
                        onChange={(e) => update(i, { hoursPerDay: Number(e.target.value) })}
                      />
                      <button className="cs-remove-btn" type="button" onClick={() => remove(i)}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="cs-add-btn"
                  type="button"
                  onClick={() => setAppliances((r) => [...r, blank()])}
                >
                  + Add appliance
                </button>
              </>
            )}
          </div>
        </div>

        {/* Step 2 — Location & system type */}
        <div className="cs-section">
          <div className="cs-section-head">
            <span className="cs-step-badge">2</span>
            <h2>Location and system type</h2>
          </div>
          <div
            className="cs-section-body"
            style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="cs-label" htmlFor="sz-client" style={{ whiteSpace: 'nowrap', margin: 0 }}>
                Client name:
              </label>
              <span style={{ fontSize: 10, color: '#9ba19d' }}>(optional)</span>
              <input
                id="sz-client"
                className="cs-input"
                style={{ width: 180 }}
                placeholder="e.g. John Mukasa"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="cs-label" htmlFor="sz-district" style={{ whiteSpace: 'nowrap', margin: 0 }}>
                District:
              </label>
              <input
                id="sz-district"
                className="cs-input"
                style={{ width: 160 }}
                list="sz-district-list"
                placeholder="Type or select"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
              <datalist id="sz-district-list">
                {DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name} />
                ))}
              </datalist>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="cs-label" htmlFor="sz-systemType" style={{ whiteSpace: 'nowrap', margin: 0 }}>
                System type:
              </label>
              <select
                id="sz-systemType"
                className="cs-select"
                value={systemType}
                onChange={(e) => setSystemType(e.target.value as SystemType)}
              >
                <option value="hybrid">Hybrid (grid + battery)</option>
                <option value="on_grid">On-grid (no battery)</option>
                <option value="off_grid">Off-grid (battery only)</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <p className="cs-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="cs-footer">
        <p>E&amp;OE · All figures are estimates pending site assessment.</p>
        <button className="cs-submit-btn" type="button" onClick={submit}>
          Calculate my system →
        </button>
      </div>
    </div>
  );
}
