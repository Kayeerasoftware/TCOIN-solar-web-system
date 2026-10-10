import { describe, expect, it } from 'vitest';
import {
  cableSizing, dailyEnergyWh, designStrings, designSystem, indicativeEstimate, maxSurgeExtraW,
  mergeParameters, nextStandard, nightFraction, peakLoadW, pickSystemVoltage, requiredArrayW,
  sizeBattery, stringFuseRatingA, stringVoltages, BREAKER_RATINGS_A, DEFAULT_PARAMETERS,
} from './sizing';
import { InverterSpec, PanelSpec, BatterySpec, SizingInput, SizingInputError } from './types';
import { bomToLineItems, parseParameters, toBattery, toInverter, toPanel } from './adapters';
import { renderReport } from './report';

const panel: PanelSpec = {
  sku: 'PV-550', pmaxW: 550, vmp: 41.8, imp: 13.16, voc: 49.9, isc: 13.9,
  tempCoeffVocPct: -0.27, tempCoeffVmpPct: -0.35, areaM2: 2.58, price: 420_000,
};
const hybrid5k: InverterSpec = {
  sku: 'INV-5K', ratedAcW: 5000, surgeW: 10000, maxDcV: 500, mpptMinV: 125, mpptMaxV: 425,
  maxInputCurrentA: 16, mpptCount: 2, batteryVoltage: 48, supportsBattery: true, price: 4_800_000,
};
const hybrid8k: InverterSpec = { ...hybrid5k, sku: 'INV-8K', ratedAcW: 8000, surgeW: 16000, price: 6_200_000 };
const gridTie: InverterSpec = { ...hybrid5k, sku: 'GT-5K', supportsBattery: false, batteryVoltage: undefined };
const battery: BatterySpec = { sku: 'BAT-5K', chemistry: 'lifepo4', nominalV: 51.2, capacityAh: 100, price: 3_500_000 };

const home = [
  { name: 'Lights', watts: 10, quantity: 10, hoursPerDay: 5, runsAtNight: true },
  { name: 'Fridge', watts: 150, quantity: 1, hoursPerDay: 10, surgeMultiplier: 3, runsAtNight: false },
  { name: 'TV', watts: 100, quantity: 1, hoursPerDay: 5, runsAtNight: true },
  { name: 'Laptop', watts: 60, quantity: 2, hoursPerDay: 4, runsAtNight: false },
];

const base: SizingInput = {
  appliances: home,
  site: { peakSunHours: 5, minAmbientC: 12, maxAmbientC: 34, areaM2: 60 },
  systemType: 'hybrid',
  autonomyDays: 1,
  panel,
  inverters: [hybrid5k, hybrid8k],
  battery,
  tariffPerKwh: 780,
};

describe('energy and load', () => {
  it('sums daily energy', () => {
    expect(dailyEnergyWh([
      { name: 'a', watts: 100, quantity: 2, hoursPerDay: 5 },
      { name: 'b', watts: 1000, quantity: 1, hoursPerDay: 1 },
    ])).toBe(2000);
  });
  it('computes peak load with simultaneity', () => {
    expect(peakLoadW(home)).toBe(100 + 150 + 100 + 120);
    expect(peakLoadW(home, 0.5)).toBe(235);
  });
  it('uses the largest single surge, not the sum', () => {
    expect(maxSurgeExtraW([
      { name: 'pump', watts: 750, quantity: 1, hoursPerDay: 2, surgeMultiplier: 3 },
      { name: 'fridge', watts: 150, quantity: 1, hoursPerDay: 10, surgeMultiplier: 4 },
    ])).toBe(1500);
  });
  it('derives night fraction from flagged appliances, else the default', () => {
    expect(nightFraction(home, 0.4)).toBeCloseTo((10 * 10 * 5 + 100 * 5) / dailyEnergyWh(home), 3);
    expect(nightFraction([{ name: 'x', watts: 100, quantity: 1, hoursPerDay: 5 }], 0.4)).toBe(0.4);
  });
});

describe('array sizing', () => {
  it('matches the hand calculation for on-grid', () => {
    // 5000 / (5 x 0.75) = 1333.33 W
    expect(requiredArrayW(5000, 0.4, 5, DEFAULT_PARAMETERS, 'on_grid')).toBeCloseTo(1333.33, 2);
  });
  it('adds battery losses for hybrid', () => {
    const w = requiredArrayW(5000, 0.4, 5, DEFAULT_PARAMETERS, 'hybrid');
    // 5000 x (1 + 0.4 x (1/0.9 - 1)) / 3.75 = 1333.33 x 1.04444
    expect(w).toBeCloseTo(1392.59, 1);
  });
  it('scales inversely with sun hours', () => {
    const a = requiredArrayW(6000, 0.4, 4, DEFAULT_PARAMETERS, 'off_grid');
    const b = requiredArrayW(6000, 0.4, 6, DEFAULT_PARAMETERS, 'off_grid');
    expect(a / b).toBeCloseTo(1.5, 2);
  });
});

describe('battery', () => {
  it('sizes a bank from autonomy, DoD, and inverter efficiency', () => {
    const b = sizeBattery(5000, 1, battery, 48, DEFAULT_PARAMETERS);
    expect(b.nominalWhRequired).toBeCloseTo(5000 / (0.9 * 0.92), 0);
    expect(b.series).toBe(1);
    expect(b.count).toBe(2);              // 6038 Wh needs 2 x 5120 Wh
    expect(b.installedKwh).toBeCloseTo(10.24, 2);
  });
  it('uses series strings to reach the bus voltage', () => {
    const b12 = sizeBattery(1000, 1, { ...battery, nominalV: 12.8, capacityAh: 100 }, 24, DEFAULT_PARAMETERS);
    expect(b12.series).toBe(2);
  });
  it('requires more capacity for lead acid than lithium', () => {
    const li = sizeBattery(5000, 1, battery, 48, DEFAULT_PARAMETERS);
    const pb = sizeBattery(5000, 1, { ...battery, chemistry: 'lead_acid' }, 48, DEFAULT_PARAMETERS);
    expect(pb.nominalWhRequired).toBeGreaterThan(li.nominalWhRequired * 1.5);
  });
  it('picks system voltage by inverter size', () => {
    const r = DEFAULT_PARAMETERS.systemVoltageRules;
    expect([pickSystemVoltage(800, r), pickSystemVoltage(2500, r), pickSystemVoltage(5000, r)]).toEqual([12, 24, 48]);
  });
});

describe('TCOIN catalog case: 24 V 200 Ah LiFePO4 (proforma 0248)', () => {
  const tcoinBattery: BatterySpec = { sku: 'LFP-24V-200AH', chemistry: 'lifepo4', nominalV: 25.6, capacityAh: 200, price: 2_900_000 };
  it('stores 5.12 kWh at 25.6 V nominal (4.8 kWh if the pack is really 24 V)', () => {
    expect(tcoinBattery.nominalV * tcoinBattery.capacityAh).toBe(5120);
    expect(24 * 200).toBe(4800);
  });
  it('covers 4 kWh of daily use with one unit on a 24 V bus', () => {
    const b = sizeBattery(4000, 1, tcoinBattery, 24, DEFAULT_PARAMETERS);
    expect(b.series).toBe(1);
    expect(b.count).toBe(1);
    expect(b.installedKwh).toBeCloseTo(5.12, 2);
  });
  it('needs two units for 5 kWh of daily use', () => {
    expect(sizeBattery(5000, 1, tcoinBattery, 24, DEFAULT_PARAMETERS).count).toBe(2);
  });
});

describe('strings', () => {
  it('raises Voc in the cold and lowers Vmp in the heat', () => {
    const v = stringVoltages(panel, 10, 35, DEFAULT_PARAMETERS);
    expect(v.vocColdV).toBeGreaterThan(panel.voc);
    expect(v.vmpHotV).toBeLessThan(panel.vmp);
    expect(v.vocColdV).toBeCloseTo(49.9 * (1 + -0.0027 * (10 - 25)), 2);
  });
  it('never exceeds the inverter maximum DC voltage', () => {
    const s = designStrings(8, panel, hybrid5k, 10, 35, DEFAULT_PARAMETERS)!;
    expect(s.stringVocColdV).toBeLessThanOrEqual(hybrid5k.maxDcV);
    expect(s.modulesPerString).toBeGreaterThanOrEqual(s.minModules);
    expect(s.modulesPerString * s.strings).toBeGreaterThanOrEqual(8);
  });
  it('returns null when the voltage window cannot be met', () => {
    const narrow = { ...hybrid5k, mpptMinV: 400, mpptMaxV: 420, maxDcV: 450 };
    expect(designStrings(8, panel, narrow, 10, 35, DEFAULT_PARAMETERS)).toBeNull();
  });
});

describe('cables and protection', () => {
  it('sizes a cable for voltage drop', () => {
    const c = cableSizing(20, 20, 48, 3);
    // 2 x 20 x 20 x 0.0206 / (48 x 0.03) = 11.44 mm2 -> 16 mm2
    expect(c.requiredMm2).toBeCloseTo(11.44, 1);
    expect(c.selectedMm2).toBe(16);
    expect(c.voltageDropPct).toBeLessThanOrEqual(3);
    expect(c.ampacityOk).toBe(true);
  });
  it('is limited by ampacity when drop is not the constraint', () => {
    const c = cableSizing(60, 2, 600, 3);
    expect(c.requiredMm2).toBeLessThan(1);          // voltage drop alone would allow a tiny cable
    expect(c.selectedMm2).toBe(16);                 // 75 A design current needs 16 mm2 (76 A)
    expect(c.ampacityOk).toBe(true);
  });
  it('rounds fuse ratings up to standard values', () => {
    expect(stringFuseRatingA(13.9)).toBe(25); // 1.56 x 13.9 = 21.7
    expect(nextStandard(33, BREAKER_RATINGS_A)).toBe(40);
  });
});

describe('designSystem', () => {
  it('produces a coherent hybrid design with a BOM', () => {
    const r = designSystem(base);
    expect(r.array.installedKwp).toBeGreaterThan(0);
    expect(r.array.panelsInstalled).toBeGreaterThanOrEqual(r.array.panelsRequired);
    expect(r.battery!.count).toBeGreaterThanOrEqual(1);
    expect(r.strings!.stringVocColdV).toBeLessThanOrEqual(hybrid5k.maxDcV);
    expect(r.inverter.ratedAcW).toBeGreaterThanOrEqual(r.energy.peakLoadW * 1.25 - 1);
    expect(r.bom.find((b) => b.role === 'panel')!.quantity).toBe(r.array.panelsInstalled);
    expect(r.bom.some((b) => b.role === 'battery')).toBe(true);
    expect(r.financials!.paybackYears).toBeGreaterThan(0);
  });
  it('omits battery items for on-grid and rejects battery-only inverters', () => {
    const r = designSystem({ ...base, systemType: 'on_grid', inverters: [gridTie, hybrid5k], battery: undefined, autonomyDays: undefined });
    expect(r.battery).toBeNull();
    expect(r.bom.some((b) => b.role === 'battery')).toBe(false);
  });
  it('selects an inverter that covers motor surge', () => {
    const pump = [{ name: 'Borehole pump', watts: 1500, quantity: 1, hoursPerDay: 3, surgeMultiplier: 4 }];
    const r = designSystem({ ...base, appliances: pump });
    // peak 1500 + surge extra 4500 = 6000 W surge -> 5 kW inverter (10 kW surge) is enough
    expect(r.inverter.surgeW).toBeGreaterThanOrEqual(6000);
  });
  it('warns when roof area limits the array', () => {
    const bigLoad = home.map((a) => ({ ...a, quantity: a.quantity * 5 }));
    const r = designSystem({ ...base, appliances: bigLoad, site: { ...base.site, areaM2: 20 } });
    expect(r.warnings.join(' ')).toMatch(/Roof area/);
    expect(r.array.maxPanelsByArea).toBe(5);
    expect(r.array.panelsInstalled).toBeLessThanOrEqual(5);
    expect(r.array.coveragePct).toBeLessThan(100);
  });
  it('flags a roof too small for one full string', () => {
    const r = designSystem({ ...base, site: { ...base.site, areaM2: 8 } });
    expect(r.warnings.join(' ')).toMatch(/below one full string/);
  });
  it('warns when no string length fits the inverter', () => {
    const bad = { ...hybrid5k, mpptMinV: 400, mpptMaxV: 420, maxDcV: 450 };
    const r = designSystem({ ...base, inverters: [bad] });
    expect(r.strings).toBeNull();
    expect(r.warnings.join(' ')).toMatch(/string length/);
  });
  it('warns when no inverter meets the requirement', () => {
    const big = [{ name: 'Welder', watts: 12000, quantity: 1, hoursPerDay: 1 }];
    const r = designSystem({ ...base, appliances: big });
    expect(r.warnings.join(' ')).toMatch(/No candidate inverter/);
  });
  it('is deterministic and does not mutate its input', () => {
    const copy = JSON.parse(JSON.stringify(base));
    const a = designSystem(base);
    const b = designSystem(base);
    expect(a).toEqual(b);
    expect(JSON.parse(JSON.stringify(base))).toEqual(copy);
  });
  it('honours parameter overrides', () => {
    const lo = designSystem({ ...base, parameters: { performanceRatio: 0.6 } });
    const hi = designSystem({ ...base, parameters: { performanceRatio: 0.85 } });
    expect(lo.array.requiredW).toBeGreaterThan(hi.array.requiredW);
  });
});

describe('validation', () => {
  it('rejects empty loads', () => {
    expect(() => designSystem({ ...base, appliances: [] })).toThrow(SizingInputError);
  });
  it('rejects hybrid without a battery', () => {
    expect(() => designSystem({ ...base, battery: undefined })).toThrow(/battery is required/);
  });
  it('rejects impossible sun hours and temperatures', () => {
    expect(() => designSystem({ ...base, site: { ...base.site, peakSunHours: 0 } })).toThrow(SizingInputError);
    expect(() => designSystem({ ...base, site: { ...base.site, minAmbientC: 40, maxAmbientC: 20 } })).toThrow(SizingInputError);
  });
  it('merges parameters without losing defaults', () => {
    const p = mergeParameters({ depthOfDischarge: { lifepo4: 0.8 } as never });
    expect(p.depthOfDischarge.lead_acid).toBe(0.5);
    expect(p.depthOfDischarge.lifepo4).toBe(0.8);
  });
});

describe('indicativeEstimate (public calculator)', () => {
  it('returns a price range around the base price', () => {
    const r = indicativeEstimate({
      monthlyKwh: 300, peakSunHours: 5, systemType: 'hybrid', tariffPerKwh: 780,
      pricePerKwp: 3_000_000, pricePerKwhBattery: 1_000_000,
    });
    expect(r.priceHigh).toBeGreaterThan(r.priceLow);
    expect(r.arrayKwp).toBeGreaterThan(0);
    expect(r.batteryKwh).toBeGreaterThan(0);
    expect(r.paybackYearsHigh!).toBeGreaterThan(r.paybackYearsLow!);
    expect(r.disclaimer).toMatch(/site survey/);
  });
  it('has no battery for on-grid', () => {
    const r = indicativeEstimate({ monthlyKwh: 300, peakSunHours: 5, systemType: 'on_grid', tariffPerKwh: 780, pricePerKwp: 3_000_000 });
    expect(r.batteryKwh).toBe(0);
  });
  it('requires an energy source', () => {
    expect(() => indicativeEstimate({ peakSunHours: 5, systemType: 'on_grid', tariffPerKwh: 1, pricePerKwp: 1 })).toThrow(SizingInputError);
  });
});

describe('cable quantities in the BOM', () => {
  it('lists cable as metres, not as one lot', () => {
    const r = designSystem(base);
    const dc = r.bom.find((b) => b.role === 'dc_string_cable')!;
    expect(dc.quantity).toBe(r.strings!.strings * 2 * 20);
    expect(r.bom.find((b) => b.role === 'ac_cable')!.quantity).toBe(15);
  });
});

describe('catalog adapters', () => {
  const row = { sku: 'PV-550', price: '420000', specs: { pmax_w: 550, vmp: 41.8, imp: 13.16, voc: 49.9, isc: 13.9, temp_coeff_voc_pct: -0.27, area_m2: 2.58 } };
  it('maps snake_case catalog specs to engine types', () => {
    const p = toPanel(row);
    expect(p.pmaxW).toBe(550);
    expect(p.tempCoeffVocPct).toBe(-0.27);
    expect(p.price).toBe(420000);
  });
  it('reports every missing spec field', () => {
    expect(() => toPanel({ sku: 'X', specs: { pmax_w: 550 } })).toThrow(/missing spec fields.*vmp.*isc/);
    expect(() => toBattery({ sku: 'B', specs: { chemistry: 'nicd', nominal_v: 12, capacity_ah: 100 } })).toThrow(/unknown chemistry/);
  });
  it('maps an inverter and the sizing.parameters setting', () => {
    const inv = toInverter({ sku: 'I', specs: { rated_ac_w: 5000, surge_w: 10000, max_dc_v: 500, mppt_min_v: 125, mppt_max_v: 425, max_input_current_a: 16, mppt_count: 2, battery_voltage: 48, supports_battery: true } });
    expect(inv.supportsBattery).toBe(true);
    const { parameters } = parseParameters({ performance_ratio: 0.8, system_voltage_rules: [{ up_to_w: 2000, volts: 24 }, { up_to_w: 1e9, volts: 48 }] });
    expect(parameters.performanceRatio).toBe(0.8);
    expect(parameters.systemVoltageRules![0]).toEqual({ upToW: 2000, volts: 24 });
  });
});

describe('line items and report', () => {
  it('builds the eight standard columns with amount = quantity x rate', () => {
    const items = bomToLineItems(
      [{ role: 'panel', sku: 'PV-550', quantity: 12 }, { role: 'earthing_kit', quantity: 1, spec: 'Earth rod' }],
      { 'PV-550': { particulars: 'Mono panel 550 W', specification: 'Mono PERC', rate: 420000 }, earthing_kit: { particulars: 'Earthing kit', rate: 250000 } },
    );
    expect(items[0]).toMatchObject({ line_no: 1, particulars: 'Mono panel 550 W', quantity: 12, unit: 'pc', rate: 420000, amount: 5040000 });
    expect(items[1].line_no).toBe(2);
    expect(items[1].amount).toBe(250000);
  });
  it('renders a report containing the key figures and the BOM table', () => {
    const r = designSystem(base);
    const md = renderReport(r, bomToLineItems(r.bom, {}), { designNo: 'DS-1' });
    expect(md).toContain('# Design calculation report DS-1');
    expect(md).toContain(`${r.array.panelsInstalled} panels`);
    expect(md).toContain('| No. | Particulars | Size / Specification | Quantity | Unit | Rate (UGX) | Amount (UGX) |');
    expect(md).toContain('## Warnings');
  });
});
