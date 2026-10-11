import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import type { Appliance } from '@/sizing/types';

type SystemType = 'off_grid' | 'hybrid' | 'on_grid';

const PRESET_APPLIANCES: Appliance[] = [
  { name: 'LED lights (×4)', watts: 40, quantity: 1, hoursPerDay: 6, runsAtNight: true },
  { name: 'TV (32")', watts: 60, quantity: 1, hoursPerDay: 5 },
  { name: 'Phone chargers (×4)', watts: 20, quantity: 1, hoursPerDay: 4 },
  { name: 'Fan', watts: 60, quantity: 1, hoursPerDay: 8 },
];

export default function CalculatorSteps() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [systemType, setSystemType] = useState<SystemType>('hybrid');
  const [location, setLocation] = useState('Kampala');
  const [appliances, setAppliances] = useState<Appliance[]>(PRESET_APPLIANCES);
  const [newApp, setNewApp] = useState({ name: '', watts: '', quantity: '1', hoursPerDay: '4' });

  function addAppliance() {
    if (!newApp.name || !newApp.watts) return;
    setAppliances((a) => [
      ...a,
      {
        name: newApp.name,
        watts: +newApp.watts,
        quantity: +newApp.quantity,
        hoursPerDay: +newApp.hoursPerDay,
      },
    ]);
    setNewApp({ name: '', watts: '', quantity: '1', hoursPerDay: '4' });
  }

  function removeAppliance(i: number) {
    setAppliances((a) => a.filter((_, idx) => idx !== i));
  }

  function goToResults() {
    navigate('/calculator/results', { state: { systemType, location, appliances } });
  }

  const totalWh = appliances.reduce((s, a) => s + a.watts * a.quantity * a.hoursPerDay, 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-green">Solar savings calculator</h1>
      <div className="mt-4 flex gap-2">
        {['System type', 'Appliances', 'Location'].map((s, i) => (
          <div
            key={s}
            className={`flex-1 rounded py-1 text-center text-xs font-medium ${i === step ? 'bg-brand-green text-white' : 'bg-surface-alt text-ink-muted'}`}
          >
            {s}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="font-bold">What type of system do you want?</h2>
          {(['off_grid', 'hybrid', 'on_grid'] as SystemType[]).map((t) => (
            <label
              key={t}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${systemType === t ? 'border-brand-green bg-green-50' : 'border-line bg-white'}`}
            >
              <input
                type="radio"
                name="type"
                value={t}
                checked={systemType === t}
                onChange={() => setSystemType(t)}
                className="mt-1"
              />
              <div>
                <div className="font-medium capitalize">{t.replace('_', '-')}</div>
                <div className="text-sm text-ink-muted">
                  {t === 'off_grid' && 'Fully independent from the grid. Requires battery storage.'}
                  {t === 'hybrid' && 'Solar + battery + grid backup. Best of both worlds.'}
                  {t === 'on_grid' && 'Grid-tied. No battery. Reduces your electricity bill.'}
                </div>
              </div>
            </label>
          ))}
          <Button className="w-full" onClick={() => setStep(1)}>
            Next →
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="mt-8 space-y-4">
          <h2 className="font-bold">What appliances do you want to power?</h2>
          <div className="rounded-lg border border-line bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-surface-alt text-xs text-ink-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Appliance</th>
                  <th className="px-3 py-2 text-right">W</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Hrs/day</th>
                  <th className="px-3 py-2 text-right">Wh/day</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {appliances.map((a, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    <td className="px-3 py-2">{a.name}</td>
                    <td className="px-3 py-2 text-right">{a.watts}</td>
                    <td className="px-3 py-2 text-right">{a.quantity}</td>
                    <td className="px-3 py-2 text-right">{a.hoursPerDay}</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {(a.watts * a.quantity * a.hoursPerDay).toFixed(0)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => removeAppliance(i)} className="text-brand-red text-xs">
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-surface-alt font-bold">
                  <td className="px-3 py-2" colSpan={4}>
                    Total
                  </td>
                  <td className="px-3 py-2 text-right text-brand-green">{totalWh.toFixed(0)} Wh/day</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <input
              className="col-span-2 rounded border border-line px-2 py-1.5 text-sm"
              placeholder="Appliance name"
              value={newApp.name}
              onChange={(e) => setNewApp((n) => ({ ...n, name: e.target.value }))}
            />
            <input
              className="rounded border border-line px-2 py-1.5 text-sm"
              placeholder="Watts"
              type="number"
              min="1"
              value={newApp.watts}
              onChange={(e) => setNewApp((n) => ({ ...n, watts: e.target.value }))}
            />
            <input
              className="rounded border border-line px-2 py-1.5 text-sm"
              placeholder="Qty"
              type="number"
              min="1"
              value={newApp.quantity}
              onChange={(e) => setNewApp((n) => ({ ...n, quantity: e.target.value }))}
            />
            <input
              className="col-span-2 rounded border border-line px-2 py-1.5 text-sm"
              placeholder="Hours/day"
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={newApp.hoursPerDay}
              onChange={(e) => setNewApp((n) => ({ ...n, hoursPerDay: e.target.value }))}
            />
            <Button variant="secondary" className="col-span-2" onClick={addAppliance}>
              + Add
            </Button>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(0)}>
              ← Back
            </Button>
            <Button className="flex-1" onClick={() => setStep(2)} disabled={appliances.length === 0}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-8 space-y-4">
          <h2 className="font-bold">Where is the site?</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">District / location</label>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kampala, Jinja, Gulu"
            />
          </div>
          <p className="text-xs text-ink-muted">
            We use your location to estimate peak sun hours (Uganda average: 5.5 h/day).
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button className="flex-1" onClick={goToResults} disabled={!location}>
              See my estimate →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
