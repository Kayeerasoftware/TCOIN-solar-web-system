/**
 * Sizing engine types. All electrical quantities use SI units unless noted:
 * W, Wh, V, A, Ah, mm2, metres, degrees Celsius.
 * The engine is pure: no database, network, or clock access.
 */

export type SystemType = 'on_grid' | 'off_grid' | 'hybrid';
export type BatteryChemistry = 'lifepo4' | 'lead_acid';

export interface Appliance {
  name: string;
  watts: number;
  quantity: number;
  hoursPerDay: number;
  /** Starting surge as a multiple of running watts (motors, pumps, compressors). Default 1. */
  surgeMultiplier?: number;
  /** True if the energy is consumed when there is no sun (served from battery). */
  runsAtNight?: boolean;
}

export interface SiteConditions {
  /** Peak sun hours on the tilted plane (kWh/m2/day). */
  peakSunHours: number;
  minAmbientC: number;
  maxAmbientC: number;
  /** Usable roof or ground area in m2, if known. */
  areaM2?: number;
}

export interface PanelSpec {
  sku: string;
  pmaxW: number;
  vmp: number;
  imp: number;
  voc: number;
  isc: number;
  /** Voc temperature coefficient in %/C (negative, e.g. -0.27). */
  tempCoeffVocPct: number;
  /** Vmp temperature coefficient in %/C. Defaults to -0.35 if omitted. */
  tempCoeffVmpPct?: number;
  areaM2: number;
  price?: number;
}

export interface InverterSpec {
  sku: string;
  ratedAcW: number;
  /** Short-term surge capability in W (typically 2x to 3x rated). */
  surgeW: number;
  maxDcV: number;
  mpptMinV: number;
  mpptMaxV: number;
  /** Maximum input short-circuit or operating current per MPPT input (A). */
  maxInputCurrentA: number;
  mpptCount: number;
  /** Battery bus voltage for hybrid and off-grid inverters. */
  batteryVoltage?: number;
  /** Hybrid or off-grid capable (supports a battery). */
  supportsBattery: boolean;
  price?: number;
}

export interface BatterySpec {
  sku: string;
  chemistry: BatteryChemistry;
  nominalV: number;
  capacityAh: number;
  price?: number;
}

export interface SizingParameters {
  performanceRatio: number;
  inverterEfficiency: number;
  batteryEfficiency: number;
  depthOfDischarge: Record<BatteryChemistry, number>;
  inverterSafetyFactor: number;
  /** Fraction of connected load assumed to run at the same time. Default 1 (conservative). */
  simultaneityFactor: number;
  maxDcAcRatio: number;
  maxVoltageDropPct: number;
  defaultNightFraction: number;
  systemVoltageRules: { upToW: number; volts: number }[];
  /** Cell temperature rise above ambient at peak irradiance. */
  cellTempRiseC: number;
  /** Fraction of the area that can carry panels (access, spacing, obstructions). */
  roofUtilisation: number;
  panelDegradationPerYear: number;
  tariffEscalationPerYear: number;
  /** Indicative cost of mounting, cabling, protection, and labour as a fraction of main equipment. */
  balanceOfSystemPct: number;
  acVoltage: number;
  acPhases: 1 | 3;
}

export interface CableRunInput {
  dcStringLengthM?: number;
  batteryLengthM?: number;
  acLengthM?: number;
}

export interface SizingInput {
  appliances: Appliance[];
  site: SiteConditions;
  systemType: SystemType;
  /** Days of autonomy (can be fractional, e.g. 0.5). Ignored for on_grid. */
  autonomyDays?: number;
  panel: PanelSpec;
  /** Candidate inverters; the smallest that satisfies all checks is selected. */
  inverters: InverterSpec[];
  battery?: BatterySpec;
  cableRuns?: CableRunInput;
  parameters?: Partial<SizingParameters>;
  /** Tariff per kWh in the quote currency, for savings. */
  tariffPerKwh?: number;
  /** Share of generation consumed on site (defaults: on_grid 0.7, hybrid 0.85, off_grid 1). */
  selfConsumptionShare?: number;
}

export interface CableResult {
  requiredMm2: number;
  selectedMm2: number;
  voltageDropPct: number;
  ampacityA: number;
  designCurrentA: number;
  ampacityOk: boolean;
  dropOk: boolean;
}

export interface StringDesign {
  modulesPerString: number;
  strings: number;
  stringsPerMppt: number;
  vocColdV: number;
  vmpHotV: number;
  vmpColdV: number;
  minModules: number;
  maxModules: number;
  stringVocColdV: number;
  stringVmpHotV: number;
  mpptCurrentOk: boolean;
}

export interface BomLine {
  role: string;
  sku?: string;
  spec?: string;
  quantity: number;
}

export interface Financials {
  equipmentCost: number;
  indicativeSystemCost: number;
  annualYieldKwh: number;
  annualSavings: number;
  paybackYears: number | null;
  lifetimeSavings25y: number;
}

export interface SizingResult {
  engineVersion: string;
  systemType: SystemType;
  parameters: SizingParameters;
  energy: {
    dailyWh: number;
    nightFraction: number;
    peakLoadW: number;
    surgeW: number;
  };
  array: {
    requiredW: number;
    panelsRequired: number;
    panelsInstalled: number;
    installedKwp: number;
    maxPanelsByArea: number | null;
    coveragePct: number;
  };
  system: { batteryBusVoltage: number | null };
  battery: null | {
    usableWh: number;
    nominalWhRequired: number;
    series: number;
    parallel: number;
    count: number;
    installedKwh: number;
    bankVoltage: number;
    bankAh: number;
  };
  inverter: { sku: string; ratedAcW: number; surgeW: number; dcAcRatio: number };
  strings: StringDesign | null;
  cables: { dcString: CableResult; battery: CableResult | null; ac: CableResult };
  protection: {
    stringFuseA: number;
    dcIsolatorV: number;
    acBreakerA: number;
    batteryBreakerA: number | null;
    surgeProtection: string[];
  };
  bom: BomLine[];
  financials: Financials | null;
  warnings: string[];
}

export class SizingInputError extends Error {
  constructor(public readonly issues: string[]) {
    super('Invalid sizing input: ' + issues.join('; '));
    this.name = 'SizingInputError';
  }
}

/** Standard line-item columns (TCOIN proforma): No., Particulars, Size / Specification, Image, Quantity, Unit, Rate, Amount. */
export interface LineItem {
  line_no: number;
  particulars: string;
  specification?: string;
  image_document_id?: string | null;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}
