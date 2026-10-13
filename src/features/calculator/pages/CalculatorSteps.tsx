import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DISTRICTS } from '@/config/districts';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { Appliance, SystemType } from '@/sizing';
import { PRESET_APPLIANCES } from '../estimate';
import type { CalculatorInput } from '../types';
import './CalculatorSteps.css';

const blank = (): Appliance => ({ name: '', watts: 0, quantity: 1, hoursPerDay: 1 });

export default function CalculatorSteps() {
  useDocumentTitle('Solar calculator');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<'bill' | 'appliances'>('bill');
  const [bill, setBill] = useState(params.get('bill') ?? '');
  const [appliances, setAppliances] = useState<Appliance[]>([blank()]);
  const [district, setDistrict] = useState('Kampala');
  const [systemType, setSystemType] = useState<SystemType>('hybrid');
  const [error, setError] = useState('');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const vw = document.documentElement.clientWidth;
      setScale(Math.min(1, vw / 794));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const update = (i: number, patch: Partial<Appliance>) =>
    setAppliances((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const remove = (i: number) => setAppliances((rows) => rows.filter((_, j) => j !== i));

  const submit = () => {
    const valid = appliances.filter(
      (a) => a.name.trim() && a.watts > 0 && a.quantity > 0 && a.hoursPerDay > 0,
    );
    if (mode === 'bill' && !(Number(bill) > 0)) return setError('Enter your monthly electricity bill.');
    if (mode === 'appliances' && !valid.length)
      return setError('Add at least one appliance with its watts and hours.');
    setError('');
    const input: CalculatorInput = {
      mode,
      monthlyBill: Number(bill) || undefined,
      appliances: valid,
      district,
      systemType,
    };
    navigate('/calculator/results', { state: { input } });
  };

  return (
    <div className="cs-stage">
      <div
        className="cs-doc"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          marginLeft: scale < 1 ? `${(document.documentElement.clientWidth - 794 * scale) / 2}px` : 'auto',
          marginRight: scale < 1 ? 0 : 'auto',
          marginBottom: scale < 1 ? `calc((${scale} - 1) * 100%)` : undefined,
        }}
      >
        <div className="cs-hero">
          <h1>Solar System Calculator</h1>
          <p>Get a free solar system estimate — no sign-up required.</p>
        </div>

        {/* ── Body ── */}
        <div className="cs-body">
          {/* Step 1 */}
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
                  <span className="cs-mode-sub">Use your bill to estimate the system</span>
                </button>
                <button
                  className={`cs-mode-btn${mode === 'appliances' ? ' active' : ''}`}
                  type="button"
                  onClick={() => setMode('appliances')}
                >
                  Appliance list
                  <span className="cs-mode-sub">Use your appliances to calculate the system</span>
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
                    onChange={(e) => setBill(e.target.value.replace(/[^\d]/g, ''))}
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
                          aria-label={`Appliance ${i + 1} name`}
                          placeholder="Name"
                          value={a.name}
                          onChange={(e) => update(i, { name: e.target.value })}
                        />
                        <input
                          className="cs-input"
                          aria-label={`Appliance ${i + 1} watts`}
                          type="number"
                          min={0}
                          placeholder="Watts"
                          value={a.watts || ''}
                          onChange={(e) => update(i, { watts: Number(e.target.value) })}
                        />
                        <input
                          className="cs-input"
                          aria-label={`Appliance ${i + 1} quantity`}
                          type="number"
                          min={1}
                          placeholder="Qty"
                          value={a.quantity}
                          onChange={(e) => update(i, { quantity: Number(e.target.value) })}
                        />
                        <input
                          className="cs-input"
                          aria-label={`Appliance ${i + 1} hours per day`}
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

          {/* Step 2 */}
          <div className="cs-section">
            <div className="cs-section-head">
              <span className="cs-step-badge">2</span>
              <h2>Location and system type</h2>
            </div>
            <div className="cs-section-body">
              <div className="cs-grid-2">
                <div className="cs-field">
                  <label className="cs-label" htmlFor="district">
                    District
                  </label>
                  <input
                    id="district"
                    className="cs-input"
                    list="district-list"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Type or select district"
                  />
                  <datalist id="district-list">
                    {DISTRICTS.map((d) => (
                      <option key={d.name} value={d.name} />
                    ))}
                  </datalist>
                </div>
                <div className="cs-field">
                  <label className="cs-label" htmlFor="systemType">
                    System type
                  </label>
                  <select
                    id="systemType"
                    className="cs-select"
                    value={systemType}
                    onChange={(e) => setSystemType(e.target.value as SystemType)}
                  >
                    <option value="hybrid">Hybrid (grid + battery)</option>
                    <option value="on_grid">On-grid (no battery)</option>
                    <option value="off_grid">Off-grid (battery only)</option>
                  </select>
                  <span className="cs-hint">
                    Hybrid keeps working in outages and uses the grid when needed.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <p className="cs-error" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="cs-footer">
          <p>E&amp;OE · All figures are estimates pending site assessment.</p>
          <button className="cs-submit-btn" type="button" onClick={submit}>
            See my estimate →
          </button>
        </div>
      </div>
    </div>
  );
}
