import { DISTRICTS } from '@/config/districts';
import { PRICING } from '@/config/pricing';
import { indicativeEstimate, type IndicativeResult } from '@/sizing';
import type { CalculatorInput } from './types';

export const peakSunHours = (district: string): number =>
  DISTRICTS.find((d) => d.name === district)?.psh ?? 5;

/** Indicative, range-based estimate using the shared sizing engine. A site survey is always needed for a binding quote. */
export function runEstimate(input: CalculatorInput): IndicativeResult {
  const common = {
    peakSunHours: peakSunHours(input.district),
    systemType: input.systemType,
    tariffPerKwh: PRICING.tariffPerKwh,
    pricePerKwp: PRICING.pricePerKwp,
    pricePerKwhBattery: PRICING.pricePerKwhBattery,
    typicalPanelW: PRICING.typicalPanelW,
  };
  return input.mode === 'bill'
    ? indicativeEstimate({ ...common, monthlyKwh: (input.monthlyBill ?? 0) / PRICING.tariffPerKwh })
    : indicativeEstimate({ ...common, appliances: input.appliances });
}

export const PRESET_APPLIANCES = [
  { name: 'LED light', watts: 10, quantity: 8, hoursPerDay: 5 },
  { name: 'Fridge', watts: 150, quantity: 1, hoursPerDay: 10 },
  { name: 'TV', watts: 100, quantity: 1, hoursPerDay: 5 },
  { name: 'Laptop', watts: 60, quantity: 1, hoursPerDay: 6 },
  { name: 'Water pump', watts: 750, quantity: 1, hoursPerDay: 1 },
];
