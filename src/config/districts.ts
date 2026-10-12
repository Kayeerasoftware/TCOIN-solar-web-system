/**
 * INDICATIVE peak sun hours (kWh/m2/day) by district for the public calculator.
 * Replace with values from PVGIS or NASA POWER, per the specification.
 */
export const DISTRICTS: { name: string; psh: number }[] = [
  { name: 'Kampala', psh: 5.0 },
  { name: 'Entebbe', psh: 5.1 },
  { name: 'Jinja', psh: 5.0 },
  { name: 'Masaka', psh: 5.0 },
  { name: 'Mbarara', psh: 5.3 },
  { name: 'Kabale', psh: 4.8 },
  { name: 'Fort Portal', psh: 4.9 },
  { name: 'Mbale', psh: 5.2 },
  { name: 'Soroti', psh: 5.5 },
  { name: 'Lira', psh: 5.4 },
  { name: 'Gulu', psh: 5.5 },
  { name: 'Arua', psh: 5.5 },
];
