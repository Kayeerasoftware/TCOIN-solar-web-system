import { useLocation, Link } from 'react-router-dom';
import { indicativeEstimate } from '@/sizing/sizing';
import type { Appliance, SystemType } from '@/sizing/types';
import { Button } from '@/components/ui/Button';

function fmt(n: number) {
  return n.toLocaleString('en-UG');
}

export default function CalculatorResults() {
  const { state } = useLocation() as {
    state: { systemType: SystemType; location: string; appliances: Appliance[] } | null;
  };

  if (!state?.appliances?.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-ink-muted">No data. Please complete the calculator first.</p>
        <Link to="/calculator" className="mt-4 inline-block text-brand-green underline">
          Start calculator
        </Link>
      </div>
    );
  }

  let result;
  try {
    result = indicativeEstimate({
      appliances: state.appliances,
      peakSunHours: 5.5,
      systemType: state.systemType,
      tariffPerKwh: 800, // UGX per kWh (approx UMEME tariff)
      pricePerKwp: 2_500_000, // UGX per kWp installed
      pricePerKwhBattery: 1_200_000,
    });
  } catch {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-brand-red">Could not calculate. Please go back and check your inputs.</p>
        <Link to="/calculator" className="mt-4 inline-block text-brand-green underline">
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-green">Your indicative estimate</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Based on {state.location} · {state.systemType.replace('_', '-')} system
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-white p-5">
          <p className="text-xs text-ink-muted uppercase tracking-wide">Daily energy use</p>
          <p className="mt-1 text-2xl font-bold text-brand-green">{fmt(result.dailyWh)} Wh</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-5">
          <p className="text-xs text-ink-muted uppercase tracking-wide">Solar array</p>
          <p className="mt-1 text-2xl font-bold text-brand-green">
            {result.arrayKwp} kWp · {result.panels} panels
          </p>
        </div>
        {result.batteryKwh > 0 && (
          <div className="rounded-lg border border-line bg-white p-5">
            <p className="text-xs text-ink-muted uppercase tracking-wide">Battery storage</p>
            <p className="mt-1 text-2xl font-bold text-brand-green">{result.batteryKwh} kWh</p>
          </div>
        )}
        <div className="rounded-lg border border-line bg-white p-5">
          <p className="text-xs text-ink-muted uppercase tracking-wide">Inverter size</p>
          <p className="mt-1 text-2xl font-bold text-brand-green">{result.inverterKw} kW</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-5">
          <p className="text-xs text-ink-muted uppercase tracking-wide">Estimated cost range</p>
          <p className="mt-1 text-2xl font-bold text-brand-green">
            UGX {fmt(result.priceLow)} – {fmt(result.priceHigh)}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white p-5">
          <p className="text-xs text-ink-muted uppercase tracking-wide">Annual savings</p>
          <p className="mt-1 text-2xl font-bold text-brand-green">UGX {fmt(result.annualSavings)}</p>
          {result.paybackYearsLow && (
            <p className="mt-1 text-sm text-ink-muted">
              Payback: {result.paybackYearsLow}–{result.paybackYearsHigh} years
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-ink-muted">{result.disclaimer}</p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link to="/calculator">
          <Button variant="secondary">← Recalculate</Button>
        </Link>
        <Link
          to="/contact"
          state={{ calculator_result: result, appliances: state.appliances, systemType: state.systemType }}
        >
          <Button>Request a formal quote →</Button>
        </Link>
      </div>
    </div>
  );
}
