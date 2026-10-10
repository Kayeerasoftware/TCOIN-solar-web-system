import { BatterySpec, BomLine, InverterSpec, LineItem, PanelSpec, SizingInputError, SizingParameters } from './types';

/** A catalog row as stored in catalog.product.specs plus the selected variant's price. */
export interface CatalogRow {
  sku: string;
  specs: Record<string, unknown>;
  price?: number | string | null;
}

function need(row: CatalogRow, keys: string[]): void {
  const missing = keys.filter((k) => row.specs[k] === undefined || row.specs[k] === null);
  if (missing.length) throw new SizingInputError([`${row.sku}: missing spec fields ${missing.join(', ')}`]);
}
const num = (v: unknown): number => Number(v);
const price = (r: CatalogRow): number | undefined => (r.price === undefined || r.price === null ? undefined : Number(r.price));

export function toPanel(r: CatalogRow): PanelSpec {
  need(r, ['pmax_w', 'vmp', 'imp', 'voc', 'isc', 'temp_coeff_voc_pct', 'area_m2']);
  const s = r.specs;
  return {
    sku: r.sku, pmaxW: num(s.pmax_w), vmp: num(s.vmp), imp: num(s.imp), voc: num(s.voc), isc: num(s.isc),
    tempCoeffVocPct: num(s.temp_coeff_voc_pct),
    tempCoeffVmpPct: s.temp_coeff_vmp_pct === undefined ? undefined : num(s.temp_coeff_vmp_pct),
    areaM2: num(s.area_m2), price: price(r),
  };
}

export function toInverter(r: CatalogRow): InverterSpec {
  need(r, ['rated_ac_w', 'surge_w', 'max_dc_v', 'mppt_min_v', 'mppt_max_v', 'max_input_current_a', 'mppt_count']);
  const s = r.specs;
  return {
    sku: r.sku, ratedAcW: num(s.rated_ac_w), surgeW: num(s.surge_w), maxDcV: num(s.max_dc_v),
    mpptMinV: num(s.mppt_min_v), mpptMaxV: num(s.mppt_max_v),
    maxInputCurrentA: num(s.max_input_current_a), mpptCount: num(s.mppt_count),
    batteryVoltage: s.battery_voltage === undefined ? undefined : num(s.battery_voltage),
    supportsBattery: Boolean(s.supports_battery), price: price(r),
  };
}

export function toBattery(r: CatalogRow): BatterySpec {
  need(r, ['chemistry', 'nominal_v', 'capacity_ah']);
  const chem = String(r.specs.chemistry);
  if (chem !== 'lifepo4' && chem !== 'lead_acid') throw new SizingInputError([`${r.sku}: unknown chemistry ${chem}`]);
  return { sku: r.sku, chemistry: chem, nominalV: num(r.specs.nominal_v), capacityAh: num(r.specs.capacity_ah), price: price(r) };
}

/** Maps the snake_case JSON in platform.setting 'sizing.parameters' to engine parameters. */
export interface SizingParametersSetting {
  performance_ratio?: number;
  inverter_efficiency?: number;
  battery_efficiency?: number;
  depth_of_discharge?: Record<'lifepo4' | 'lead_acid', number>;
  inverter_safety_factor?: number;
  max_voltage_drop_pct?: number;
  default_night_fraction?: number;
  system_voltage_rules?: { up_to_w: number; volts: number }[];
  default_min_ambient_c?: number;
  default_max_ambient_c?: number;
}

export function parseParameters(v: SizingParametersSetting): { parameters: Partial<SizingParameters>; defaultMinAmbientC?: number; defaultMaxAmbientC?: number } {
  const p: Partial<SizingParameters> = {};
  if (v.performance_ratio !== undefined) p.performanceRatio = v.performance_ratio;
  if (v.inverter_efficiency !== undefined) p.inverterEfficiency = v.inverter_efficiency;
  if (v.battery_efficiency !== undefined) p.batteryEfficiency = v.battery_efficiency;
  if (v.depth_of_discharge) p.depthOfDischarge = v.depth_of_discharge;
  if (v.inverter_safety_factor !== undefined) p.inverterSafetyFactor = v.inverter_safety_factor;
  if (v.max_voltage_drop_pct !== undefined) p.maxVoltageDropPct = v.max_voltage_drop_pct;
  if (v.default_night_fraction !== undefined) p.defaultNightFraction = v.default_night_fraction;
  if (Array.isArray(v.system_voltage_rules)) p.systemVoltageRules = v.system_voltage_rules.map((r) => ({ upToW: r.up_to_w, volts: r.volts }));
  return { parameters: p, defaultMinAmbientC: v.default_min_ambient_c, defaultMaxAmbientC: v.default_max_ambient_c };
}

/**
 * Turns the engine BOM into the standard eight-column line items.
 * `lookup` maps a SKU, or a BOM role for lines without a SKU, to display data and rate.
 */
export function bomToLineItems(
  bom: BomLine[],
  lookup: Record<string, { particulars: string; specification?: string; unit?: string; rate: number; image_document_id?: string | null }>,
): LineItem[] {
  return bom.map((b, i) => {
    const hit = (b.sku && lookup[b.sku]) || lookup[b.role];
    const rate = hit?.rate ?? 0;
    return {
      line_no: i + 1,
      particulars: hit?.particulars ?? b.role.replace(/_/g, ' '),
      specification: hit?.specification ?? b.spec,
      image_document_id: hit?.image_document_id ?? null,
      quantity: b.quantity,
      unit: hit?.unit ?? 'pc',
      rate,
      amount: Math.round(b.quantity * rate * 100) / 100,
    };
  });
}
