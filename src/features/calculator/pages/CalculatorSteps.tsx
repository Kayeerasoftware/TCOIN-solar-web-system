import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FormField } from '@/components/forms/FormField';
import { Select, TextInput } from '@/components/forms/controls';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DISTRICTS } from '@/config/districts';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { Appliance, SystemType } from '@/sizing';
import { PRESET_APPLIANCES } from '../estimate';
import type { CalculatorInput } from '../types';

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

  const update = (i: number, patch: Partial<Appliance>) =>
    setAppliances((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

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
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <h1 className="text-2xl font-bold text-brand-green">Solar calculator</h1>
      <p className="text-ink-muted">
        Answer two short steps to see an indicative system size and price range.
      </p>
      <Card title="Step 1 of 2: Your energy use">
        <fieldset className="mb-3 flex gap-4">
          <legend className="sr-only">How do you want to describe your use?</legend>
          <label className="flex items-center gap-2">
            <input type="radio" name="mode" checked={mode === 'bill'} onChange={() => setMode('bill')} />{' '}
            Monthly bill
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              checked={mode === 'appliances'}
              onChange={() => setMode('appliances')}
            />{' '}
            Appliance list
          </label>
        </fieldset>
        {mode === 'bill' ? (
          <FormField label="Monthly electricity bill (UGX)" htmlFor="bill">
            <TextInput
              id="bill"
              inputMode="numeric"
              value={bill}
              onChange={(e) => setBill(e.target.value.replace(/[^\d]/g, ''))}
            />
          </FormField>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2" aria-label="Quick add">
              {PRESET_APPLIANCES.map((p) => (
                <Button
                  key={p.name}
                  variant="secondary"
                  type="button"
                  onClick={() =>
                    setAppliances((rows) => [...rows.filter((r) => r.name || r.watts), { ...p }])
                  }
                >
                  + {p.name}
                </Button>
              ))}
            </div>
            {appliances.map((a, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <TextInput
                  aria-label={`Appliance ${i + 1} name`}
                  placeholder="Name"
                  value={a.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  className="col-span-2"
                />
                <TextInput
                  aria-label={`Appliance ${i + 1} watts`}
                  type="number"
                  min={0}
                  placeholder="Watts"
                  value={a.watts || ''}
                  onChange={(e) => update(i, { watts: Number(e.target.value) })}
                />
                <TextInput
                  aria-label={`Appliance ${i + 1} quantity`}
                  type="number"
                  min={1}
                  placeholder="Qty"
                  value={a.quantity}
                  onChange={(e) => update(i, { quantity: Number(e.target.value) })}
                />
                <TextInput
                  aria-label={`Appliance ${i + 1} hours per day`}
                  type="number"
                  min={0}
                  max={24}
                  step="0.5"
                  placeholder="Hours/day"
                  value={a.hoursPerDay}
                  onChange={(e) => update(i, { hoursPerDay: Number(e.target.value) })}
                />
              </div>
            ))}
            <Button variant="secondary" type="button" onClick={() => setAppliances((r) => [...r, blank()])}>
              Add appliance
            </Button>
          </div>
        )}
      </Card>
      <Card title="Step 2 of 2: Location and system">
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="District" htmlFor="district">
            <Select id="district" value={district} onChange={(e) => setDistrict(e.target.value)}>
              {DISTRICTS.map((d) => (
                <option key={d.name}>{d.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField
            label="System type"
            htmlFor="systemType"
            hint="Hybrid keeps working in outages and uses the grid when needed."
          >
            <Select
              id="systemType"
              value={systemType}
              onChange={(e) => setSystemType(e.target.value as SystemType)}
            >
              <option value="hybrid">Hybrid (grid + battery)</option>
              <option value="on_grid">On-grid (no battery)</option>
              <option value="off_grid">Off-grid (battery only)</option>
            </Select>
          </FormField>
        </div>
      </Card>
      {error && (
        <p role="alert" className="text-brand-red">
          {error}
        </p>
      )}
      <Button onClick={submit}>See my estimate</Button>
    </div>
  );
}
