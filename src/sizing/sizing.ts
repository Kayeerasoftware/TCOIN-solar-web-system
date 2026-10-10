import {
  Appliance, BatterySpec, BomLine, CableResult, Financials, InverterSpec, PanelSpec,
  SizingInput, SizingInputError, SizingParameters, SizingResult, StringDesign, SystemType,
} from './types';

export const ENGINE_VERSION = '1.0.0';

export const DEFAULT_PARAMETERS: SizingParameters = {
  performanceRatio: 0.75,
  inverterEfficiency: 0.92,
  batteryEfficiency: 0.9,
  depthOfDischarge: { lifepo4: 0.9, lead_acid: 0.5 },
  inverterSafetyFactor: 1.25,
  simultaneityFactor: 1,
  maxDcAcRatio: 1.3,
  maxVoltageDropPct: 3,
  defaultNightFraction: 0.4,
  systemVoltageRules: [
    { upToW: 1000, volts: 12 },
    { upToW: 3000, volts: 24 },
    { upToW: 1e9, volts: 48 },
  ],
  cellTempRiseC: 25,
  roofUtilisation: 0.7,
  panelDegradationPerYear: 0.005,
  tariffEscalationPerYear: 0,
  balanceOfSystemPct: 0.3,
  acVoltage: 230,
  acPhases: 1,
};

/** Standard conductor sizes (mm2) and indicative copper ampacities (A, installed in conduit, 30C). */
export const CABLE_SIZES_MM2 = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120] as const;
export const CABLE_AMPACITY_A: Record<number, number> = {
  1.5: 17, 2.5: 24, 4: 32, 6: 41, 10: 57, 16: 76, 25: 101, 35: 125, 50: 151, 70: 192, 95: 232, 120: 269,
};
export const BREAKER_RATINGS_A = [
  6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630,
];
export const DC_VOLTAGE_RATINGS_V = [250, 600, 1000, 1100, 1500];
/** Copper resistivity at 70C operating temperature, ohm.mm2/m. */
export const COPPER_RESISTIVITY_70C = 0.0206;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
const round = (n: number, d = 2): number => {
  const f = 10 ** d;
  return Math.round((n + Number.EPSILON) * f) / f;
};

export function nextStandard(value: number, list: readonly number[]): number {
  for (const v of list) if (v >= value) return v;
  return list[list.length - 1];
}

export function mergeParameters(p?: Partial<SizingParameters>): SizingParameters {
  return {
    ...DEFAULT_PARAMETERS,
    ...(p ?? {}),
    depthOfDischarge: { ...DEFAULT_PARAMETERS.depthOfDischarge, ...(p?.depthOfDischarge ?? {}) },
    systemVoltageRules: p?.systemVoltageRules ?? DEFAULT_PARAMETERS.systemVoltageRules,
  };
}

// ---------------------------------------------------------------------------
// energy and load
// ---------------------------------------------------------------------------
/** E = sum(P x qty x hours), Wh/day */
export function dailyEnergyWh(appliances: Appliance[]): number {
  return round(appliances.reduce((s, a) => s + a.watts * a.quantity * a.hoursPerDay, 0));
}

/** Peak running load in W, after applying the simultaneity factor. */
export function peakLoadW(appliances: Appliance[], simultaneity = 1): number {
  return round(appliances.reduce((s, a) => s + a.watts * a.quantity, 0) * simultaneity);
}

/** Largest single start-up surge above running power (one motor starts at a time). */
export function maxSurgeExtraW(appliances: Appliance[]): number {
  return round(Math.max(0, ...appliances.map((a) => a.watts * ((a.surgeMultiplier ?? 1) - 1))));
}

/** Share of daily energy consumed without sun. Uses flagged appliances, else the default. */
export function nightFraction(appliances: Appliance[], fallback: number): number {
  const total = dailyEnergyWh(appliances);
  if (total === 0) return fallback;
  const flagged = appliances.some((a) => a.runsAtNight !== undefined);
  if (!flagged) return fallback;
  const night = appliances
    .filter((a) => a.runsAtNight)
    .reduce((s, a) => s + a.watts * a.quantity * a.hoursPerDay, 0);
  return round(night / total, 3);
}

// ---------------------------------------------------------------------------
// array
// ---------------------------------------------------------------------------
/**
 * P_array = E x (1 + nf x (1/eta_batt - 1)) / (PSH x PR)
 * The nf term adds the losses of energy that passes through storage.
 */
export function requiredArrayW(
  dailyWh: number, nf: number, psh: number, p: SizingParameters, systemType: SystemType,
): number {
  const effectiveNf = systemType === 'on_grid' ? 0 : nf;
  const energyAtArray = dailyWh * (1 + effectiveNf * (1 / p.batteryEfficiency - 1));
  return round(energyAtArray / (psh * p.performanceRatio));
}

// ---------------------------------------------------------------------------
// battery
// ---------------------------------------------------------------------------
export function pickSystemVoltage(ratedW: number, rules: SizingParameters['systemVoltageRules']): number {
  const sorted = [...rules].sort((a, b) => a.upToW - b.upToW);
  return (sorted.find((r) => ratedW <= r.upToW) ?? sorted[sorted.length - 1]).volts;
}

export function sizeBattery(
  dailyWh: number, autonomyDays: number, battery: BatterySpec, busVoltage: number, p: SizingParameters,
) {
  const dod = p.depthOfDischarge[battery.chemistry];
  const usableWh = dailyWh * autonomyDays;
  const nominalWhRequired = usableWh / (dod * p.inverterEfficiency);
  const series = Math.max(1, Math.round(busVoltage / battery.nominalV));
  const unitWh = battery.nominalV * battery.capacityAh;
  const parallel = Math.max(1, Math.ceil(nominalWhRequired / (series * unitWh)));
  const count = series * parallel;
  return {
    usableWh: round(usableWh),
    nominalWhRequired: round(nominalWhRequired),
    series,
    parallel,
    count,
    installedKwh: round((count * unitWh) / 1000, 3),
    bankVoltage: round(series * battery.nominalV, 1),
    bankAh: round(parallel * battery.capacityAh, 1),
  };
}

// ---------------------------------------------------------------------------
// inverter selection
// ---------------------------------------------------------------------------
export interface InverterRequirement {
  continuousW: number;
  surgeW: number;
}

export function inverterRequirement(
  appliances: Appliance[], arrayW: number, systemType: SystemType, p: SizingParameters,
): InverterRequirement {
  const peak = peakLoadW(appliances, p.simultaneityFactor);
  const loadBased = peak * p.inverterSafetyFactor;
  const arrayBased = arrayW / p.maxDcAcRatio;
  const continuousW = systemType === 'on_grid' ? arrayBased : Math.max(loadBased, arrayBased);
  const surgeW = peak + maxSurgeExtraW(appliances);
  return { continuousW: round(continuousW), surgeW: round(surgeW) };
}

export function selectInverter(
  candidates: InverterSpec[], req: InverterRequirement, needsBattery: boolean,
): { inverter: InverterSpec; met: boolean } {
  const usable = candidates.filter((c) => !needsBattery || c.supportsBattery);
  if (usable.length === 0) {
    throw new SizingInputError(['No candidate inverter supports the required system type']);
  }
  const sorted = [...usable].sort((a, b) => a.ratedAcW - b.ratedAcW);
  const ok = sorted.find((c) => c.ratedAcW >= req.continuousW && c.surgeW >= req.surgeW);
  return ok ? { inverter: ok, met: true } : { inverter: sorted[sorted.length - 1], met: false };
}

// ---------------------------------------------------------------------------
// string design
// ---------------------------------------------------------------------------
export function stringVoltages(panel: PanelSpec, minC: number, maxC: number, p: SizingParameters) {
  const tcVoc = panel.tempCoeffVocPct / 100;
  const tcVmp = (panel.tempCoeffVmpPct ?? -0.35) / 100;
  const cellMax = maxC + p.cellTempRiseC;
  return {
    vocColdV: round(panel.voc * (1 + tcVoc * (minC - 25)), 2),
    vmpColdV: round(panel.vmp * (1 + tcVmp * (minC - 25)), 2),
    vmpHotV: round(panel.vmp * (1 + tcVmp * (cellMax - 25)), 2),
  };
}

/**
 * Chooses modules per string within [min, max] allowed by the inverter, preferring the arrangement
 * that needs the fewest extra panels to balance strings. Returns null if no valid length exists.
 */
export function designStrings(
  panelCount: number, panel: PanelSpec, inv: InverterSpec,
  minC: number, maxC: number, p: SizingParameters,
): (StringDesign & { panelsInstalled: number }) | null {
  const v = stringVoltages(panel, minC, maxC, p);
  const maxByVoc = Math.floor(inv.maxDcV / v.vocColdV);
  const maxByMppt = Math.floor(inv.mpptMaxV / v.vmpColdV);
  const maxModules = Math.min(maxByVoc, maxByMppt);
  const minModules = Math.ceil(inv.mpptMinV / v.vmpHotV);
  if (minModules > maxModules || maxModules < 1) return null;

  let best: { n: number; strings: number; waste: number } | null = null;
  for (let n = maxModules; n >= Math.max(1, minModules); n--) {
    const strings = Math.ceil(panelCount / n);
    const waste = n * strings - panelCount;
    if (!best || waste < best.waste) best = { n, strings, waste };
  }
  const { n, strings } = best!;
  const stringsPerMppt = Math.ceil(strings / inv.mpptCount);
  return {
    modulesPerString: n,
    strings,
    stringsPerMppt,
    vocColdV: v.vocColdV,
    vmpHotV: v.vmpHotV,
    vmpColdV: v.vmpColdV,
    minModules,
    maxModules,
    stringVocColdV: round(n * v.vocColdV, 1),
    stringVmpHotV: round(n * v.vmpHotV, 1),
    mpptCurrentOk: stringsPerMppt * panel.isc <= inv.maxInputCurrentA,
    panelsInstalled: n * strings,
  };
}

// ---------------------------------------------------------------------------
// cables and protection
// ---------------------------------------------------------------------------
/** A_min = 2 x L x I x rho / (V x allowed_drop). Picks the next standard size that also meets ampacity. */
export function cableSizing(
  currentA: number, lengthM: number, voltageV: number, maxDropPct: number,
  options: { singlePhaseAc?: boolean } = {},
): CableResult {
  const designCurrentA = currentA * 1.25;
  const factor = options.singlePhaseAc ? 2 : 2; // out and back for single-phase and DC
  const requiredMm2 =
    (factor * lengthM * currentA * COPPER_RESISTIVITY_70C) / (voltageV * (maxDropPct / 100));
  let selected = CABLE_SIZES_MM2[CABLE_SIZES_MM2.length - 1] as number;
  for (const s of CABLE_SIZES_MM2) {
    if (s >= requiredMm2 && CABLE_AMPACITY_A[s] >= designCurrentA) {
      selected = s;
      break;
    }
  }
  const drop = ((factor * lengthM * currentA * COPPER_RESISTIVITY_70C) / selected / voltageV) * 100;
  return {
    requiredMm2: round(requiredMm2, 2),
    selectedMm2: selected,
    voltageDropPct: round(drop, 2),
    ampacityA: CABLE_AMPACITY_A[selected],
    designCurrentA: round(designCurrentA, 1),
    ampacityOk: CABLE_AMPACITY_A[selected] >= designCurrentA,
    dropOk: drop <= maxDropPct + 1e-9,
  };
}

/** String fuse or breaker: 1.56 x Isc, rounded up to a standard rating. */
export function stringFuseRatingA(isc: number): number {
  return nextStandard(1.56 * isc, BREAKER_RATINGS_A);
}

// ---------------------------------------------------------------------------
// financials
// ---------------------------------------------------------------------------
export function computeFinancials(args: {
  installedKwp: number; psh: number; p: SizingParameters; systemType: SystemType;
  equipmentCost?: number; tariffPerKwh?: number; selfConsumptionShare?: number;
}): Financials | null {
  const { installedKwp, psh, p, systemType, equipmentCost, tariffPerKwh } = args;
  if (equipmentCost === undefined || tariffPerKwh === undefined) return null;
  const share = args.selfConsumptionShare ??
    (systemType === 'off_grid' ? 1 : systemType === 'hybrid' ? 0.85 : 0.7);
  const annualYieldKwh = installedKwp * psh * 365 * p.performanceRatio;
  const annualSavings = annualYieldKwh * share * tariffPerKwh;
  const indicativeSystemCost = equipmentCost * (1 + p.balanceOfSystemPct);
  let lifetime = 0;
  for (let y = 0; y < 25; y++) {
    lifetime +=
      annualSavings * (1 - p.panelDegradationPerYear) ** y * (1 + p.tariffEscalationPerYear) ** y;
  }
  return {
    equipmentCost: round(equipmentCost),
    indicativeSystemCost: round(indicativeSystemCost),
    annualYieldKwh: round(annualYieldKwh),
    annualSavings: round(annualSavings),
    paybackYears: annualSavings > 0 ? round(indicativeSystemCost / annualSavings, 1) : null,
    lifetimeSavings25y: round(lifetime),
  };
}

// ---------------------------------------------------------------------------
// input validation
// ---------------------------------------------------------------------------
export function validateInput(input: SizingInput): void {
  const issues: string[] = [];
  if (!input.appliances?.length) issues.push('At least one appliance is required');
  input.appliances?.forEach((a, i) => {
    if (!(a.watts > 0)) issues.push(`Appliance ${i + 1} (${a.name}): watts must be > 0`);
    if (!(a.quantity > 0)) issues.push(`Appliance ${i + 1} (${a.name}): quantity must be > 0`);
    if (!(a.hoursPerDay >= 0 && a.hoursPerDay <= 24)) issues.push(`Appliance ${i + 1} (${a.name}): hours must be 0 to 24`);
    if (a.surgeMultiplier !== undefined && a.surgeMultiplier < 1) issues.push(`Appliance ${i + 1} (${a.name}): surge multiplier must be >= 1`);
  });
  if (!(input.site?.peakSunHours > 0 && input.site.peakSunHours <= 9)) issues.push('Peak sun hours must be between 0 and 9');
  if (input.site && input.site.minAmbientC > input.site.maxAmbientC) issues.push('Minimum ambient temperature exceeds maximum');
  if (!input.inverters?.length) issues.push('At least one candidate inverter is required');
  if (input.systemType !== 'on_grid') {
    if (!input.battery) issues.push('A battery is required for off_grid and hybrid systems');
    if (!(input.autonomyDays !== undefined && input.autonomyDays > 0)) issues.push('Autonomy days must be > 0 for off_grid and hybrid systems');
  }
  if (issues.length) throw new SizingInputError(issues);
}

// ---------------------------------------------------------------------------
// orchestrator
// ---------------------------------------------------------------------------
export function designSystem(input: SizingInput): SizingResult {
  validateInput(input);
  const p = mergeParameters(input.parameters);
  const warnings: string[] = [];
  const { appliances, site, systemType, panel } = input;
  const withBattery = systemType !== 'on_grid';

  // 1. energy
  const dailyWh = dailyEnergyWh(appliances);
  const nf = nightFraction(appliances, p.defaultNightFraction);
  const peak = peakLoadW(appliances, p.simultaneityFactor);
  const req0 = inverterRequirement(appliances, 0, systemType, p);

  // 2. array (first pass), then inverter, then strings
  const arrayW = requiredArrayW(dailyWh, nf, site.peakSunHours, p, systemType);
  let panelsRequired = Math.ceil(arrayW / panel.pmaxW);

  const req = inverterRequirement(appliances, panelsRequired * panel.pmaxW, systemType, p);
  const { inverter, met } = selectInverter(input.inverters, req, withBattery);
  if (!met) {
    warnings.push(
      `No candidate inverter meets ${req.continuousW} W continuous and ${req.surgeW} W surge; ` +
      `the largest (${inverter.sku}, ${inverter.ratedAcW} W) was selected. Add a larger inverter or split the load.`,
    );
  }

  // 3. roof area
  const maxPanelsByArea = site.areaM2 !== undefined
    ? Math.floor((site.areaM2 * p.roofUtilisation) / panel.areaM2) : null;
  let panelsTarget = panelsRequired;
  if (maxPanelsByArea !== null && panelsTarget > maxPanelsByArea) {
    warnings.push(
      `Roof area allows about ${maxPanelsByArea} panels but ${panelsRequired} are required; array limited to roof capacity.`,
    );
    panelsTarget = Math.max(1, maxPanelsByArea);
  }

  // 4. strings (may round panels up to balance strings)
  const sd = designStrings(panelsTarget, panel, inverter, site.minAmbientC, site.maxAmbientC, p);
  let strings: StringDesign | null = null;
  let panelsInstalled = panelsTarget;
  if (!sd) {
    warnings.push(
      `No valid string length: panel ${panel.sku} does not fit the voltage window of inverter ${inverter.sku}. Choose a different panel or inverter.`,
    );
  } else {
    const { panelsInstalled: pi, ...rest } = sd;
    strings = rest;
    panelsInstalled = pi;
    if (maxPanelsByArea !== null && pi > maxPanelsByArea) {
      // try to stay within the roof by rounding down instead
      const down = Math.floor(maxPanelsByArea / rest.modulesPerString) * rest.modulesPerString;
      if (down >= rest.modulesPerString) {
        panelsInstalled = down;
        strings = { ...rest, strings: down / rest.modulesPerString,
          stringsPerMppt: Math.ceil(down / rest.modulesPerString / inverter.mpptCount) };
        warnings.push('Array rounded down to complete strings within roof capacity.');
      } else {
        warnings.push('Roof capacity is below one full string.');
      }
    } else if (pi > panelsTarget) {
      warnings.push(`Array rounded up from ${panelsTarget} to ${pi} panels to form equal strings of ${rest.modulesPerString}.`);
    }
    if (!rest.mpptCurrentOk) {
      warnings.push(
        `Strings per MPPT (${rest.stringsPerMppt}) x Isc (${panel.isc} A) exceed the inverter input current limit (${inverter.maxInputCurrentA} A).`,
      );
    }
    if (rest.stringVocColdV > inverter.maxDcV) {
      warnings.push('String cold open-circuit voltage exceeds the inverter maximum DC voltage.');
    }
  }
  panelsRequired = Math.ceil(arrayW / panel.pmaxW);
  const installedW = panelsInstalled * panel.pmaxW;
  const coveragePct = round(Math.min(100, (installedW / arrayW) * 100), 1);
  if (coveragePct < 99.9) warnings.push(`Installed array covers about ${coveragePct}% of the energy requirement.`);
  if (installedW / inverter.ratedAcW > p.maxDcAcRatio) {
    warnings.push(`DC/AC ratio ${round(installedW / inverter.ratedAcW, 2)} exceeds the limit of ${p.maxDcAcRatio}.`);
  }

  // 5. battery
  let busVoltage: number | null = null;
  let battery: SizingResult['battery'] = null;
  if (withBattery && input.battery) {
    busVoltage = inverter.batteryVoltage ?? pickSystemVoltage(inverter.ratedAcW, p.systemVoltageRules);
    battery = sizeBattery(dailyWh, input.autonomyDays as number, input.battery, busVoltage, p);
    if (Math.abs(battery.bankVoltage - busVoltage) / busVoltage > 0.15) {
      warnings.push(`Battery bank voltage ${battery.bankVoltage} V does not match the inverter bus voltage ${busVoltage} V.`);
    }
  }

  // 6. cables (indicative; engineers confirm on site)
  const runs = input.cableRuns ?? {};
  const maxDrop = p.maxVoltageDropPct;
  const dcString = cableSizing(
    panel.isc, runs.dcStringLengthM ?? 20,
    strings ? strings.stringVmpHotV : panel.vmp, maxDrop,
  );
  const acCurrent = inverter.ratedAcW /
    (p.acPhases === 3 ? Math.sqrt(3) * p.acVoltage : p.acVoltage);
  const ac = cableSizing(acCurrent, runs.acLengthM ?? 15, p.acVoltage, maxDrop, { singlePhaseAc: p.acPhases === 1 });
  const batteryCurrent = busVoltage ? inverter.ratedAcW / (busVoltage * p.inverterEfficiency) : 0;
  const batteryCable = busVoltage
    ? cableSizing(batteryCurrent, runs.batteryLengthM ?? 2, busVoltage, Math.min(maxDrop, 1)) : null;
  for (const [name, c] of [['DC string', dcString], ['AC', ac], ['Battery', batteryCable]] as const) {
    if (c && !c.dropOk) warnings.push(`${name} cable run exceeds ${maxDrop}% voltage drop even at the largest standard size; shorten the run or raise the voltage.`);
  }

  // 7. protection
  const stringFuseA = stringFuseRatingA(panel.isc);
  const dcIsolatorV = nextStandard(strings ? strings.stringVocColdV : panel.voc, DC_VOLTAGE_RATINGS_V);
  const acBreakerA = nextStandard(acCurrent * 1.25, BREAKER_RATINGS_A);
  const batteryBreakerA = busVoltage ? nextStandard(batteryCurrent * 1.25, BREAKER_RATINGS_A) : null;

  // 8. surge
  const surgeW = req.surgeW;
  void req0;

  // 9. BOM
  const bom: BomLine[] = [
    { role: 'panel', sku: panel.sku, quantity: panelsInstalled },
    { role: 'inverter', sku: inverter.sku, quantity: 1 },
  ];
  if (battery && input.battery) bom.push({ role: 'battery', sku: input.battery.sku, quantity: battery.count });
  if (strings) {
    bom.push({ role: 'dc_string_cable', spec: `${dcString.selectedMm2} mm2 solar cable (m)`, quantity: strings.strings * 2 * (runs.dcStringLengthM ?? 20) });
    if (strings.strings >= 3) bom.push({ role: 'dc_string_fuse', spec: `${stringFuseA} A, ${dcIsolatorV} V DC`, quantity: strings.strings * 2 });
    bom.push({ role: 'dc_isolator', spec: `${dcIsolatorV} V DC, >= ${nextStandard(strings.stringsPerMppt * panel.isc * 1.25, BREAKER_RATINGS_A)} A`, quantity: inverter.mpptCount });
    bom.push({ role: 'connectors_mc4', spec: 'MC4-compatible pairs', quantity: strings.strings });
  }
  bom.push({ role: 'ac_breaker', spec: `${acBreakerA} A`, quantity: 1 });
  bom.push({ role: 'ac_cable', spec: `${ac.selectedMm2} mm2 AC cable (m)`, quantity: runs.acLengthM ?? 15 });
  if (batteryBreakerA) bom.push({ role: 'battery_breaker', spec: `${batteryBreakerA} A DC`, quantity: 1 });
  bom.push({ role: 'spd_dc', spec: 'Type 2 DC surge protector', quantity: 1 });
  bom.push({ role: 'spd_ac', spec: 'Type 2 AC surge protector', quantity: 1 });
  bom.push({ role: 'earthing_kit', spec: 'Earth rod, bonding conductor, clamps', quantity: 1 });
  bom.push({ role: 'mounting_kit', spec: `Rails and clamps for ${panelsInstalled} panels`, quantity: 1 });

  // 10. financials
  const equipment =
    panel.price !== undefined && inverter.price !== undefined &&
    (!input.battery || input.battery.price !== undefined)
      ? panelsInstalled * panel.price + inverter.price + (battery && input.battery ? battery.count * (input.battery.price as number) : 0)
      : undefined;
  const financials = computeFinancials({
    installedKwp: installedW / 1000, psh: site.peakSunHours, p, systemType,
    equipmentCost: equipment, tariffPerKwh: input.tariffPerKwh,
    selfConsumptionShare: input.selfConsumptionShare,
  });

  return {
    engineVersion: ENGINE_VERSION,
    systemType,
    parameters: p,
    energy: { dailyWh, nightFraction: nf, peakLoadW: peak, surgeW },
    array: {
      requiredW: arrayW,
      panelsRequired,
      panelsInstalled,
      installedKwp: round(installedW / 1000, 3),
      maxPanelsByArea,
      coveragePct,
    },
    system: { batteryBusVoltage: busVoltage },
    battery,
    inverter: {
      sku: inverter.sku, ratedAcW: inverter.ratedAcW, surgeW: inverter.surgeW,
      dcAcRatio: round(installedW / inverter.ratedAcW, 2),
    },
    strings,
    cables: { dcString, battery: batteryCable, ac },
    protection: {
      stringFuseA, dcIsolatorV, acBreakerA, batteryBreakerA,
      surgeProtection: ['Type 2 DC SPD', 'Type 2 AC SPD'],
    },
    bom,
    financials,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// public calculator: simplified, range-based estimate
// ---------------------------------------------------------------------------
export interface IndicativeInput {
  /** Provide either monthlyKwh or appliances. */
  monthlyKwh?: number;
  appliances?: Appliance[];
  peakSunHours: number;
  systemType: SystemType;
  tariffPerKwh: number;
  /** Installed price per kWp in the quote currency. */
  pricePerKwp: number;
  /** Battery price per kWh (for hybrid and off-grid). */
  pricePerKwhBattery?: number;
  /** Hours of backup (hybrid) or autonomy as days (off-grid), expressed in days. Default 0.5 hybrid, 1 off-grid. */
  autonomyDays?: number;
  typicalPanelW?: number;
  parameters?: Partial<SizingParameters>;
}

export interface IndicativeResult {
  dailyWh: number;
  arrayKwp: number;
  panels: number;
  batteryKwh: number;
  inverterKw: number;
  priceLow: number;
  priceHigh: number;
  annualSavings: number;
  paybackYearsLow: number | null;
  paybackYearsHigh: number | null;
  disclaimer: string;
}

export function indicativeEstimate(i: IndicativeInput): IndicativeResult {
  const p = mergeParameters(i.parameters);
  let dailyWh: number;
  if (i.monthlyKwh !== undefined) dailyWh = (i.monthlyKwh * 1000) / 30;
  else if (i.appliances?.length) dailyWh = dailyEnergyWh(i.appliances);
  else throw new SizingInputError(['Provide monthlyKwh or appliances']);
  if (!(dailyWh > 0)) throw new SizingInputError(['Energy use must be > 0']);

  const nf = i.appliances ? nightFraction(i.appliances, p.defaultNightFraction) : p.defaultNightFraction;
  const arrayW = requiredArrayW(dailyWh, nf, i.peakSunHours, p, i.systemType);
  const panelW = i.typicalPanelW ?? 550;
  const panels = Math.ceil(arrayW / panelW);
  const arrayKwp = round((panels * panelW) / 1000, 2);

  const autonomy = i.systemType === 'on_grid' ? 0 : i.autonomyDays ?? (i.systemType === 'hybrid' ? 0.5 : 1);
  const batteryKwh = round((dailyWh * autonomy) / (p.depthOfDischarge.lifepo4 * p.inverterEfficiency) / 1000, 1);
  const peakKw = i.appliances ? peakLoadW(i.appliances, p.simultaneityFactor) / 1000 * p.inverterSafetyFactor
    : (dailyWh / 1000) / 6 * p.inverterSafetyFactor; // rough: energy spread over about 6 busy hours
  const inverterKw = round(Math.max(peakKw, arrayKwp / p.maxDcAcRatio), 1);

  const base = arrayKwp * i.pricePerKwp + batteryKwh * (i.pricePerKwhBattery ?? 0);
  const priceLow = Math.round(base * 0.85);
  const priceHigh = Math.round(base * 1.15);
  const share = i.systemType === 'off_grid' ? 1 : i.systemType === 'hybrid' ? 0.85 : 0.7;
  const annualSavings = Math.round(arrayKwp * i.peakSunHours * 365 * p.performanceRatio * share * i.tariffPerKwh);
  return {
    dailyWh: round(dailyWh), arrayKwp, panels, batteryKwh, inverterKw, priceLow, priceHigh, annualSavings,
    paybackYearsLow: annualSavings > 0 ? round(priceLow / annualSavings, 1) : null,
    paybackYearsHigh: annualSavings > 0 ? round(priceHigh / annualSavings, 1) : null,
    disclaimer: 'Indicative estimate only. A site survey is required for a binding design and price.',
  };
}
