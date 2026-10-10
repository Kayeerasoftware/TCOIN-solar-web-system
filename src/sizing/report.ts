import { LineItem, SizingResult } from './types';

const n = (v: number, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Renders a calculation report (markdown) for the design package. Every figure comes from the result. */
export function renderReport(r: SizingResult, items?: LineItem[], meta: { designNo?: string; customer?: string; date?: string } = {}): string {
  const L: string[] = [];
  L.push(`# Design calculation report${meta.designNo ? ' ' + meta.designNo : ''}`);
  L.push(`${meta.customer ? 'Customer: ' + meta.customer + '. ' : ''}${meta.date ? 'Date: ' + meta.date + '. ' : ''}System type: ${r.systemType}. Engine ${r.engineVersion}.`, '');
  const p = r.parameters;
  L.push('## Assumptions',
    `- Performance ratio ${p.performanceRatio}, inverter efficiency ${p.inverterEfficiency}, battery round-trip efficiency ${p.batteryEfficiency}`,
    `- Inverter safety factor ${p.inverterSafetyFactor}, maximum voltage drop ${p.maxVoltageDropPct}%`, '');
  L.push('## Energy and load',
    `- Daily energy ${n(r.energy.dailyWh)} Wh; night share ${n(r.energy.nightFraction * 100, 1)}%`,
    `- Peak load ${n(r.energy.peakLoadW)} W; peak with largest motor start ${n(r.energy.surgeW)} W`, '');
  L.push('## Array',
    `- Required ${n(r.array.requiredW)} W gives ${r.array.panelsRequired} panels; installed ${r.array.panelsInstalled} panels (${n(r.array.installedKwp, 2)} kWp), covering ${r.array.coveragePct}% of the requirement`,
    r.strings ? `- ${r.strings.strings} string(s) of ${r.strings.modulesPerString}; cold Voc per string ${r.strings.stringVocColdV} V, hot Vmp per string ${r.strings.stringVmpHotV} V (allowed ${r.strings.minModules} to ${r.strings.maxModules} modules)` : '- No valid string configuration (see warnings)', '');
  if (r.battery) L.push('## Battery',
    `- Needs ${n(r.battery.nominalWhRequired)} Wh nominal; selected ${r.battery.series} in series x ${r.battery.parallel} in parallel = ${r.battery.count} units, ${n(r.battery.installedKwh, 2)} kWh, ${r.battery.bankVoltage} V, ${r.battery.bankAh} Ah`, '');
  L.push('## Inverter', `- ${r.inverter.sku}: ${n(r.inverter.ratedAcW)} W continuous, ${n(r.inverter.surgeW)} W surge, DC/AC ratio ${r.inverter.dcAcRatio}`, '');
  const c = r.cables;
  L.push('## Cables and protection',
    `- DC string cable ${c.dcString.selectedMm2} mm2 (drop ${c.dcString.voltageDropPct}%); AC cable ${c.ac.selectedMm2} mm2 (drop ${c.ac.voltageDropPct}%)` + (c.battery ? `; battery cable ${c.battery.selectedMm2} mm2 (drop ${c.battery.voltageDropPct}%)` : ''),
    `- String fuse ${r.protection.stringFuseA} A; DC isolator ${r.protection.dcIsolatorV} V; AC breaker ${r.protection.acBreakerA} A` + (r.protection.batteryBreakerA ? `; battery breaker ${r.protection.batteryBreakerA} A` : ''), '');
  if (items?.length) {
    L.push('## Bill of materials', '| No. | Particulars | Size / Specification | Quantity | Unit | Rate (UGX) | Amount (UGX) |', '|---|---|---|---|---|---|---|');
    for (const i of items) L.push(`| ${i.line_no} | ${i.particulars} | ${i.specification ?? ''} | ${n(i.quantity)} | ${i.unit} | ${n(i.rate)} | ${n(i.amount)} |`);
    L.push(`| | | | | | **Total** | **${n(items.reduce((s, i) => s + i.amount, 0))}** |`, '');
  }
  if (r.financials) L.push('## Financial summary',
    `- Indicative system cost ${n(r.financials.indicativeSystemCost)}; annual yield ${n(r.financials.annualYieldKwh)} kWh; annual savings ${n(r.financials.annualSavings)}; payback ${r.financials.paybackYears ?? 'n/a'} years`, '');
  L.push('## Warnings', ...(r.warnings.length ? r.warnings.map((w) => `- ${w}`) : ['- None']));
  return L.join('\n');
}
