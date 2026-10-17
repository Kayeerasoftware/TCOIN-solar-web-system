import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, withIdempotency } from '@/api/client';
import type { IndicativeResult } from '@/sizing';
import type { Appliance, SystemType } from '@/sizing/types';
import { saveQuote, nextQtnRef } from '../savedQuotes';
import '@/features/calculator';
import '../portal.css';

function fmt(n: string | number) {
  return Number(n).toLocaleString('en-UG');
}

export interface QuotationPrefill {
  result: IndicativeResult;
  appliances: Appliance[];
  district: string;
  systemType: SystemType;
  clientName?: string;
}

interface DraftLine {
  id: string;
  particulars: string;
  spec: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  fromCatalog: boolean;
  variantId?: string;
  imageUrl?: string;
}

type Product = {
  id: string;
  name: string;
  product_type: string;
  spec_text?: string;
  brand?: string;
  images?: { url: string }[];
  variants: { id: string; sku: string; name: string; unit: string; price: { amount: string } }[];
};

// Map product_type to store image fallbacks
const TYPE_IMG: Record<string, string> = {
  panel: '/products display/Solar-panels.jpg',
  inverter: '/products display/Inverter.jpg',
  battery: '/products display/battery.jpg',
};

function productImage(p: Product): string {
  return p.images?.[0]?.url ?? TYPE_IMG[p.product_type] ?? '';
}

// Pick best-fit panel: closest wattage per panel to target
function bestPanel(panels: Product[], targetWatts: number): Product | null {
  if (!panels.length) return null;
  return panels.reduce((best, p) => {
    const bW = Number(best.spec_text?.match(/(\d+)\s*W/)?.[1] ?? 0);
    const pW = Number(p.spec_text?.match(/(\d+)\s*W/)?.[1] ?? 0);
    return Math.abs(pW - targetWatts) < Math.abs(bW - targetWatts) ? p : best;
  });
}

// Extract kW from spec: handles "8 kW", "3kVA", "3000VA", "2400W"
function specKw(spec: string | undefined): number {
  if (!spec) return 0;
  const kw = spec.match(/(\d+(?:\.\d+)?)\s*kW/i);
  if (kw) return Number(kw[1]);
  const kva = spec.match(/(\d+(?:\.\d+)?)\s*kVA/i);
  if (kva) return Number(kva[1]);
  const va = spec.match(/(\d+(?:\.\d+)?)\s*VA/i);
  if (va) return Number(va[1]) / 1000;
  const w = spec.match(/(\d+(?:\.\d+)?)\s*W/i);
  if (w) return Number(w[1]) / 1000;
  return 0;
}

// Extract kWh from spec: handles "5kWh", "225Ah, 6V" (Ah×V/1000)
function specKwh(spec: string | undefined): number {
  if (!spec) return 0;
  const kwh = spec.match(/(\d+(?:\.\d+)?)\s*kWh/i);
  if (kwh) return Number(kwh[1]);
  const ah = spec.match(/(\d+(?:\.\d+)?)\s*Ah/i);
  const v = spec.match(/(\d+(?:\.\d+)?)\s*V/i);
  if (ah && v) return (Number(ah[1]) * Number(v[1])) / 1000;
  return 0;
}

// Pick best-fit inverter: closest kW to target
function bestInverter(inverters: Product[], targetKw: number): Product | null {
  if (!inverters.length) return null;
  return inverters.reduce((best, p) =>
    Math.abs(specKw(p.spec_text) - targetKw) < Math.abs(specKw(best.spec_text) - targetKw) ? p : best,
  );
}

// Pick best-fit battery: closest kWh to target total
function bestBattery(batteries: Product[], targetKwh: number): Product | null {
  if (!batteries.length) return null;
  return batteries.reduce((best, p) =>
    Math.abs(specKwh(p.spec_text) - targetKwh) < Math.abs(specKwh(best.spec_text) - targetKwh) ? p : best,
  );
}

// Reference BOM fallback (from TCOIN standard install BOM, scaled to 6-panel/4-battery/3kVA baseline)
// scale(n, base, actual) proportionally scales qty from reference baseline
function scale(base: number, actual: number, refQty: number): number {
  return Math.max(1, Math.round((actual / base) * refQty));
}

function buildDraftLines(result: IndicativeResult, products: Product[]): DraftLine[] {
  const byType = (t: string) => products.filter((p) => p.product_type === t);
  const panels = byType('panel');
  const inverters = byType('inverter');
  const batteries = byType('battery');
  const mountings = byType('mounting').filter((p) => !p.name.toLowerCase().includes('cabinet'));
  const cables = byType('cable');

  // Reference baseline: 6 panels × 450 W, 4 batteries × 200 Ah/12 V (≈9.6 kWh), 3 kVA inverter
  const REF_PANELS = 6;
  const REF_BAT = 4; // units
  const REF_INV_KW = 3;

  const panelWatts = Math.round((result.arrayKwp * 1000) / result.panels);
  const pv = bestPanel(panels, panelWatts);
  const inv = bestInverter(inverters, result.inverterKw);
  const bat = result.batteryKwh > 0 ? bestBattery(batteries, result.batteryKwh) : null;
  const mnt = mountings[0] ?? null;
  const cbl = cables[0] ?? null;

  const pvV = pv?.variants[0] ?? null;
  const invV = inv?.variants[0] ?? null;
  const batV = bat?.variants[0] ?? null;
  const mntV = mnt?.variants[0] ?? null;
  const cblV = cbl?.variants[0] ?? null;

  // Quantities derived from sizing
  const pvQty = result.panels;
  const invKwEach = specKw(inv?.spec_text) || result.inverterKw;
  const invQty = Math.max(1, Math.ceil(result.inverterKw / invKwEach));
  const batKwhEach = specKwh(bat?.spec_text) || 2.4; // 200Ah×12V default
  const batQty = result.batteryKwh > 0 ? Math.ceil(result.batteryKwh / batKwhEach) : 0;
  const mntPanelsEach = Number(mnt?.spec_text?.match(/(\d+)\s*panel/i)?.[1] ?? 1);
  const mntQty = Math.ceil(result.panels / (mntPanelsEach || 1));

  // Rates: catalog first, then reference BOM prices
  const pvRate = pvV ? Number(pvV.price.amount) : 550_000;
  const invRate = invV ? Number(invV.price.amount) : 2_400_000;
  const batRate = batV ? Number(batV.price.amount) : 1_100_000;
  const mntRate = mntV ? Number(mntV.price.amount) : 750_000;

  // Helper: build a line — catalog match or reference-BOM fallback
  function line(
    id: string,
    catalogProduct: Product | null,
    catalogVariant: { id: string; unit: string; price: { amount: string } } | null,
    refParticulars: string,
    refSpec: string,
    qty: number,
    unit: string,
    rate: number,
    imageUrl = '',
  ): DraftLine {
    if (catalogProduct && catalogVariant) {
      return {
        id,
        fromCatalog: true,
        variantId: catalogVariant.id,
        particulars: catalogProduct.name,
        spec: catalogProduct.spec_text ?? refSpec,
        qty,
        unit: catalogVariant.unit,
        rate: Number(catalogVariant.price.amount),
        amount: Number(catalogVariant.price.amount) * qty,
        imageUrl: productImage(catalogProduct),
      };
    }
    return {
      id,
      fromCatalog: false,
      imageUrl,
      particulars: refParticulars,
      spec: refSpec,
      qty,
      unit,
      rate,
      amount: rate * qty,
    };
  }

  // DC cable metres: ~4 m per panel for string runs + 20 m trunk
  const dcMetres10 = scale(REF_PANELS, result.panels, 24);
  const dcMetres25 = scale(REF_PANELS, result.panels, 16);
  const acMetres4 = scale(REF_INV_KW, result.inverterKw, 15);

  const lines: DraftLine[] = [];

  // 1. Solar PV panels
  lines.push(
    line(
      'l-panels',
      pv,
      pvV,
      'Solar PV Panels',
      `${panelWatts} W Mono-Half Cut, VOC=47 V, VMP=40.1 V, ISC=11.9 A, IMP=11.25 A, 1960×1060×35 mm`,
      pvQty,
      'pcs',
      pvRate,
    ),
  );

  // 2. Inverter
  lines.push(
    line(
      'l-inverter',
      inv,
      invV,
      'Solar Inverter',
      `${result.inverterKw} kW/kVA, 24 V, 50/60 Hz, built-in MPPT 100 A, PV input max 4000 W/125–500 V, WiFi/4G module`,
      invQty,
      'pc',
      invRate,
    ),
  );

  // 3. Storage battery (only if system has battery)
  if (result.batteryKwh > 0) {
    lines.push(
      line(
        'l-battery',
        bat,
        batV,
        'Storage Battery',
        'GEL Battery 200 Ah, 12 V, 522×240×219 mm (61.5 kg)',
        batQty,
        'pcs',
        batRate,
      ),
    );

    // 4. Battery rack (scales with battery qty)
    const rackQty = Math.ceil(batQty / 4);
    lines.push({
      id: 'l-rack',
      fromCatalog: false,
      imageUrl: '',
      particulars: 'Battery Rack',
      spec: 'Metallic smooth fabrication, painted, ground protection pads',
      qty: rackQty,
      unit: 'pc',
      rate: 355_000,
      amount: 355_000 * rackQty,
    });
  }

  // 5. Panel mounting stands
  lines.push(
    line(
      'l-mount',
      mnt,
      mntV,
      'Panel Stands',
      'Non-corrosive aluminium rails, roof / ground mount',
      mntQty,
      'set',
      mntRate,
    ),
  );

  // 6. DC cable 10 mm²
  lines.push(
    line(
      'l-dc10',
      cbl,
      cblV,
      'DC Cable 10 mm²',
      'UV DC cable 10 mm² duo-core multistranded, black & blue',
      dcMetres10,
      'Mtr',
      12_000,
    ),
  );

  // 7. DC cable 25 mm²
  lines.push({
    id: 'l-dc25',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'DC Cable 25 mm²',
    spec: 'UV DC cable 25 mm² single-core multistranded, red & blue',
    qty: dcMetres25,
    unit: 'Mtr',
    rate: 14_000,
    amount: 14_000 * dcMetres25,
  });

  // 8. AC cable 4 mm²
  lines.push({
    id: 'l-ac4',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'AC Cable 4 mm²',
    spec: 'Single-core 4 mm², red, black & yellow-green',
    qty: acMetres4,
    unit: 'Mtr',
    rate: 4_200,
    amount: 4_200 * acMetres4,
  });

  // 9. Twin with earth 2.5 mm²
  lines.push({
    id: 'l-twe25',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'Twin with Earth 2.5 mm²',
    spec: 'Twin with earth 2.5 mm², 100 m roll',
    qty: 1,
    unit: 'Roll',
    rate: 360_000,
    amount: 360_000,
  });

  // 10. Twin with earth 1.5 mm²
  lines.push({
    id: 'l-twe15',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'Twin with Earth 1.5 mm²',
    spec: 'Twin with earth 1.5 mm², 100 m roll',
    qty: 1,
    unit: 'Roll',
    rate: 270_000,
    amount: 270_000,
  });

  // 11. AC circuit breakers
  const acBreakers = scale(REF_INV_KW, result.inverterKw, 7);
  lines.push({
    id: 'l-acb',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'AC Circuit Breakers',
    spec: 'AC MCB, assorted ratings',
    qty: acBreakers,
    unit: 'pcs',
    rate: 35_000,
    amount: 35_000 * acBreakers,
  });

  // 12. DC circuit breaker + enclosure
  const dcBreakers = scale(REF_BAT, batQty || 1, 4);
  lines.push({
    id: 'l-dcb',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'DC Circuit Breaker 100 A + Enclosure',
    spec: '100 A DC circuit breaker with enclosure',
    qty: dcBreakers,
    unit: 'pcs',
    rate: 50_000,
    amount: 50_000 * dcBreakers,
  });

  // 13. Waterproof board with indicator
  lines.push({
    id: 'l-board',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'Waterproof Board with Indicator Set',
    spec: 'IP65 distribution board with indicator lights',
    qty: 1,
    unit: 'pc',
    rate: 170_000,
    amount: 170_000,
  });

  // 14. AVS
  lines.push({
    id: 'l-avs',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'Automatic Voltage Switcher (AVS-30A)',
    spec: 'AVS 30 A, automatic voltage protection',
    qty: 1,
    unit: 'pc',
    rate: 145_000,
    amount: 145_000,
  });

  // 15. Manual changeover
  lines.push({
    id: 'l-mco',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'Manual Changeover Switch 32 A',
    spec: 'Emergency manual changeover, 32 A single phase',
    qty: 1,
    unit: 'pc',
    rate: 270_000,
    amount: 270_000,
  });

  // 16. ATS
  lines.push({
    id: 'l-ats',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'Automatic Transfer Switch 63 A Digital',
    spec: 'ATS 63 A digital, single phase',
    qty: 1,
    unit: 'pc',
    rate: 370_000,
    amount: 370_000,
  });

  // 17. WiFi dongle
  lines.push({
    id: 'l-wifi',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'WiFi Dongle — Solar Monitor',
    spec: 'WiFi Plug Pro, Android/iOS app, RJ45 communication port',
    qty: 1,
    unit: 'pc',
    rate: 190_000,
    amount: 190_000,
  });

  // 18. Trunking
  lines.push({
    id: 'l-trunk',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'Cable Trunking 40×40 mm',
    spec: 'White heavy-duty PVC trunking, 40×40 mm',
    qty: scale(REF_PANELS, result.panels, 2),
    unit: 'pcs',
    rate: 25_000,
    amount: 25_000 * scale(REF_PANELS, result.panels, 2),
  });

  // 19. Cable lugs 10 mm²
  lines.push({
    id: 'l-lug10',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'Cable Lugs 10 mm² Copper',
    spec: '10 mm² copper cable lugs',
    qty: scale(REF_PANELS, result.panels, 6),
    unit: 'pcs',
    rate: 2_000,
    amount: 2_000 * scale(REF_PANELS, result.panels, 6),
  });

  // 20. Cable lugs 25 mm²
  lines.push({
    id: 'l-lug25',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'Cable Lugs 25 mm² Copper',
    spec: '25 mm² copper cable lugs',
    qty: scale(REF_PANELS, result.panels, 16),
    unit: 'pcs',
    rate: 2_500,
    amount: 2_500 * scale(REF_PANELS, result.panels, 16),
  });

  // 21. Accessories bundle (wall plugs, clips, ties, screws)
  lines.push({
    id: 'l-acc',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'Installation Accessories',
    spec: 'Wall plugs (10 mm & 14 mm), cable clips (6 mm & 10 mm), cable ties, self-tapping screws (1.5" & 3")',
    qty: 1,
    unit: 'lot',
    rate: 133_000,
    amount: 133_000,
  });

  // 22. Installation & commissioning
  lines.push({
    id: 'l-install',
    fromCatalog: false,
    imageUrl: '',
    particulars: 'Installation & Commissioning',
    spec: 'Labour, transport, site survey, system testing',
    qty: 1,
    unit: 'lot',
    rate: 0,
    amount: 0,
  });

  return lines;
}

// Derive catalog type from particulars text for smart pre-filtering
function typeFromParticulars(particulars: string): string {
  const p = particulars.toLowerCase();
  if (/panel|pv|solar module|mono|poly/.test(p)) return 'panel';
  if (/inverter|mppt|hybrid inv/.test(p)) return 'inverter';
  if (/battery|gel|lifepo|lithium|agm/.test(p)) return 'battery';
  if (/cable|wire|twin|dc cable|ac cable/.test(p)) return 'cable';
  if (/mount|stand|rack|rail/.test(p)) return 'mounting';
  return '';
}

function ProductPicker({
  role,
  products,
  onPick,
  onClose,
}: {
  role: string;
  products: Product[];
  onPick: (p: Product) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const filtered = q.trim()
    ? products.filter((p) =>
        `${p.name} ${p.spec_text ?? ''} ${p.brand ?? ''}`.toLowerCase().includes(q.toLowerCase()),
      )
    : products;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '2px solid #173b28',
          width: 560,
          maxWidth: '95vw',
          maxHeight: '82vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid #e0e5e2',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f1f4f1',
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: '#293269',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Pick {role || 'product'} from catalog
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#69736d' }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '10px 18px', borderBottom: '1px solid #e0e5e2', background: '#fff' }}>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, spec, brand…"
            style={{
              width: '100%',
              padding: '7px 12px',
              border: '1px solid #c8cfc9',
              fontSize: 13,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.length === 0 && (
            <div className="pt-empty">
              <p>No products match "{q}"</p>
            </div>
          )}
          {filtered.map((p) => (
            <div
              key={p.id}
              style={{
                padding: '10px 18px',
                borderBottom: '1px solid #e0e5e2',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {(p.images?.[0]?.url || TYPE_IMG[p.product_type]) && (
                  <img
                    src={p.images?.[0]?.url ?? TYPE_IMG[p.product_type]}
                    alt=""
                    style={{
                      width: 44,
                      height: 36,
                      objectFit: 'cover',
                      border: '1px solid #e0e5e2',
                      flexShrink: 0,
                    }}
                  />
                )}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1d2f25' }}>{p.name}</div>
                  {p.spec_text && (
                    <div style={{ fontSize: 11, color: '#69736d', marginTop: 2 }}>{p.spec_text}</div>
                  )}
                  {p.variants[0] && (
                    <div style={{ fontSize: 11, color: '#14723a', fontWeight: 700, marginTop: 3 }}>
                      UGX {fmt(p.variants[0].price.amount)} / {p.variants[0].unit}
                    </div>
                  )}
                </div>
              </div>
              <button
                className="pt-btn-primary pt-btn-sm"
                onClick={() => {
                  onPick(p);
                  onClose();
                }}
              >
                Select
              </button>
            </div>
          ))}
        </div>
        <div
          style={{
            padding: '8px 18px',
            borderTop: '1px solid #e0e5e2',
            background: '#f9faf9',
            fontSize: 11,
            color: '#9ba19d',
            textAlign: 'right',
          }}
        >
          {filtered.length} of {products.length} product{products.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}

const issueDate = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}).format(new Date());
const SYSTEM_LABEL: Record<string, string> = {
  hybrid: 'Hybrid (Grid + Battery)',
  on_grid: 'On-Grid (Grid-Tied)',
  off_grid: 'Off-Grid (Battery Only)',
};
const COL = '1fr 190px 72px 58px 50px 120px 120px 100px 34px';

export function FreeQuotation({ prefill, onSaved }: { prefill?: QuotationPrefill; onSaved?: () => void }) {
  const [name, setName] = useState(prefill?.clientName?.trim() ?? '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [picker, setPicker] = useState<{ role: string; type: string; lineId: string } | null>(null);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ref] = useState(() => nextQtnRef());

  const { data: productsData } = useQuery({
    queryKey: ['catalog-products-all'],
    queryFn: () => api.get('/catalog/products').then((r) => r.data.data ?? []),
    staleTime: 300_000,
  });
  const allProducts: Product[] = productsData ?? [];

  const [lines, setLines] = useState<DraftLine[]>(() =>
    prefill ? buildDraftLines(prefill.result, allProducts) : [],
  );
  const [builtFromCatalog, setBuiltFromCatalog] = useState(false);
  if (prefill && allProducts.length > 0 && !builtFromCatalog) {
    setLines(buildDraftLines(prefill.result, allProducts));
    setBuiltFromCatalog(true);
  }

  function addBlankLine() {
    setLines((ls) => [
      ...ls,
      {
        id: `l-${Date.now()}`,
        fromCatalog: false,
        particulars: '',
        spec: '',
        qty: 1,
        unit: 'pc',
        rate: 0,
        amount: 0,
      },
    ]);
  }

  function updateLine(id: string, k: keyof DraftLine, v: string | number | boolean) {
    setLines((ls) =>
      ls.map((l) => {
        if (l.id !== id) return l;
        const u = { ...l, [k]: v };
        if (k === 'qty' || k === 'rate') u.amount = Number(u.qty) * Number(u.rate);
        return u;
      }),
    );
  }

  function swapFromCatalog(lineId: string, product: Product) {
    const v = product.variants[0];
    setLines((ls) =>
      ls.map((l) =>
        l.id !== lineId
          ? l
          : {
              ...l,
              fromCatalog: true,
              variantId: v?.id,
              particulars: product.name,
              spec: product.spec_text ?? '',
              unit: v?.unit ?? l.unit,
              rate: v ? Number(v.price.amount) : l.rate,
              amount: v ? Number(v.price.amount) * l.qty : l.amount,
            },
      ),
    );
  }

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const vat = Math.round(subtotal * 0.18);
  const total = subtotal + vat;

  function handleSave() {
    saveQuote({
      id: `sq-${Date.now()}`,
      ref,
      created_at: new Date().toISOString(),
      source: 'free_request',
      name,
      email,
      phone,
      notes,
      ...(prefill
        ? {
            district: prefill.district,
            system_type: prefill.systemType,
            system_type_label: prefill.systemType,
            appliances: prefill.appliances,
            sizing: prefill.result,
          }
        : { system_type_label: 'custom' }),
      lines: lines.map(({ particulars, spec, qty, unit, rate, amount }) => ({
        particulars,
        spec,
        qty,
        unit,
        rate,
        amount,
      })),
      subtotal,
      vat,
      total,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handlePrint() {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    const rows = lines
      .map(
        (l, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f7f9f7'}">
        <td style="text-align:center;color:#9ba19d;font-size:10px;font-weight:700;border-right:1px solid #e0e5e2;padding:5px 4px">${i + 1}</td>
        <td style="border-right:1px solid #e0e5e2;padding:4px;text-align:center">${l.imageUrl ? `<img src="${l.imageUrl}" style="width:48px;height:40px;object-fit:cover;border:1px solid #e0e5e2;display:block;margin:auto"/>` : '<div style="width:48px;height:40px;background:#f1f4f1;border:1px dashed #c8cfc9;margin:auto"></div>'}</td>
        <td style="border-right:1px solid #e0e5e2;padding:5px 7px;font-weight:700;font-size:11px;vertical-align:top">${l.particulars}</td>
        <td style="border-right:1px solid #e0e5e2;padding:5px 7px;color:#555f59;font-size:10px;line-height:1.5;vertical-align:top">${l.spec || '&mdash;'}</td>
        <td style="border-right:1px solid #e0e5e2;padding:5px 7px;text-align:center;font-weight:600">${l.qty}</td>
        <td style="border-right:1px solid #e0e5e2;padding:5px 7px;text-align:center;color:#69736d">${l.unit}</td>
        <td style="border-right:1px solid #e0e5e2;padding:5px 7px;text-align:right">${l.rate > 0 ? fmt(l.rate) : '&mdash;'}</td>
        <td style="padding:5px 7px;text-align:right;font-weight:700;color:${l.amount > 0 ? '#1d2f25' : '#9ba19d'}">${l.amount > 0 ? fmt(l.amount) : '&mdash;'}</td>
      </tr>`,
      )
      .join('');
    const totalsHtml = [
      { label: 'Subtotal', val: subtotal, bold: false },
      { label: 'VAT (18%)', val: vat, bold: false },
      { label: 'TOTAL', val: total, bold: true },
    ]
      .map(
        ({ label, val, bold }) => `
      <tr style="background:${bold ? '#173b28' : '#fff'}">
        <td colspan="6"></td>
        <td style="padding:6px 10px;text-align:right;font-size:${bold ? 12 : 11}px;font-weight:${bold ? 900 : 400};color:${bold ? '#eaf3b5' : '#69736d'};border-top:${bold ? '2px solid #173b28' : '1px solid #e0e5e2'};border-right:1px solid ${bold ? 'rgba(255,255,255,0.2)' : '#e0e5e2'}">${label}</td>
        <td style="padding:6px 10px;text-align:right;font-size:${bold ? 12 : 11}px;font-weight:${bold ? 900 : 400};color:${bold ? '#eaf3b5' : '#69736d'};border-top:${bold ? '2px solid #173b28' : '1px solid #e0e5e2'}">UGX ${fmt(val)}</td>
      </tr>`,
      )
      .join('');
    const sysInfo = prefill
      ? `${prefill.result.arrayKwp} kWp &middot; ${prefill.result.panels} panels &middot; ${prefill.result.inverterKw} kW inverter${prefill.result.batteryKwh > 0 ? ` &middot; ${prefill.result.batteryKwh} kWh battery` : ''}`
      : '';
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Free Quotation &ndash; ${name || 'TCOIN Solar'}</title>
      <style>
        @page { size:A4; margin:12mm 10mm; }
        * { box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        body { margin:0; font-family:'DM Sans',Arial,sans-serif; color:#18201b; font-size:11px; }
        .masthead { display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .logo { height:52px; width:auto; }
        .tagline { font-size:11px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:#1d6434; display:block; margin-top:3px; }
        .center { flex:1; text-align:center; }
        .center strong { font-size:17px; font-weight:900; display:block; }
        .center span { font-size:10px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:#1d6434; }
        .details { text-align:right; font-size:9.5px; line-height:1.6; color:#3c4540; }
        .stripe { height:3px; background:#14723a; margin:5px 0 2px; }
        .stripe2 { height:2px; background:#d92c32; }
        .services { font-size:9px; font-style:italic; color:#555f59; border-bottom:1px dashed #555c57; padding:5px 0 6px; line-height:1.6; }
        .services p { margin:0; }
        .party { display:grid; grid-template-columns:1.1fr 1fr; gap:14px; margin-top:12px; }
        .client-block { border:1px solid #28312c; padding:10px 12px; }
        .client-block .lbl { font-size:8px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#69736d; margin:0 0 5px; }
        .client-row { display:flex; gap:6px; font-size:10.5px; line-height:1.8; }
        .client-row span:first-child { font-weight:800; width:52px; flex-shrink:0; color:#69736d; }
        .inv-block { border:1px solid #28312c; }
        .inv-block h1 { margin:0; padding:6px 10px; border-bottom:1px solid #28312c; font-family:Georgia,serif; font-size:16px; text-align:center; text-transform:uppercase; color:#1d2f25; }
        .inv-block table { width:100%; border-collapse:collapse; }
        .inv-block td { padding:3px 8px; font-size:10.5px; border-bottom:1px solid #9ba19d; }
        .inv-block td:first-child { font-weight:700; border-right:1px solid #9ba19d; width:42%; }
        table.bom { width:100%; border-collapse:collapse; border:1px solid #28312c; margin-top:14px; font-size:10.5px; }
        table.bom th { background:#173b28; color:#eaf3b5; padding:6px 7px; font-size:9px; font-weight:800; letter-spacing:.05em; text-transform:uppercase; border-right:1px solid rgba(255,255,255,.15); text-align:left; }
        table.bom td { border-bottom:1px solid #e0e5e2; vertical-align:middle; }
        .sigs { display:grid; grid-template-columns:1fr 1fr; gap:50px; margin-top:24px; }
        .sig-line { display:flex; align-items:center; gap:6px; font-size:10px; }
        .sig-line span { white-space:nowrap; }
        .sig-line i { flex:1; height:14px; border-bottom:1px dotted #606863; display:block; }
        .sigs strong { font-size:9px; display:block; margin-top:3px; }
        footer { display:flex; justify-content:space-between; align-items:center; margin-top:20px; padding-top:7px; border-top:2px solid #173b28; }
        footer strong { font-size:13px; }
        footer span { font-size:9px; color:#7a837e; }
      </style>
    </head><body>
      <div class="masthead">
        <div>
          <img src="/brand/TCOIN%20LOGO%20OFFICIAL.svg" class="logo" onerror="this.src='/brand/logo.png'">
          <span class="tagline">CENTER OF INNOVATIONS</span>
        </div>
        <div class="center"><strong>TCOIN Solar Uganda</strong><span>We Plan and Do</span></div>
        <div class="details">
          <strong>Nabulagala &mdash; near Kasubi Royal Tombs</strong><br>
          P.O. Box 500273, Kampala, Uganda<br>
          Tel: 0779 116 709 &middot; 0705 998 786 &middot; 0705 111 123<br>
          info.tcoinug@gmail.com &middot; www.tcoinug.com
        </div>
      </div>
      <div class="stripe"></div><div class="stripe2"></div>
      <div class="services">
        <p>Solar design, inspection, installation, maintenance and consultancy</p>
        <p>Electrical installations, system design, inspection and maintenance</p>
        <p>Supply of electrical, electronic and solar installation materials</p>
      </div>
      <div class="party">
        <div class="client-block">
          <p class="lbl">Prepared for</p>
          ${[
            ['Client', name || '&mdash;'],
            ['District', prefill ? `${prefill.district}, Uganda` : '&mdash;'],
            ['System', prefill ? (SYSTEM_LABEL[prefill.systemType] ?? prefill.systemType) : '&mdash;'],
            ['Phone', phone || '&mdash;'],
            ['Email', email || '&mdash;'],
          ]
            .map(([l, v]) => `<div class="client-row"><span>${l}:</span><span>${v}</span></div>`)
            .join('')}
        </div>
        <div class="inv-block">
          <h1>Free Quotation</h1>
          <table><tbody>
            <tr><td>Date</td><td>${issueDate}</td></tr>
            <tr><td>Validity</td><td>30 days from issue</td></tr>
            <tr><td>Prepared by</td><td>TCOIN Solar Uganda</td></tr>
            ${sysInfo ? `<tr><td>System size</td><td>${sysInfo}</td></tr>` : ''}
          </tbody></table>
        </div>
      </div>
      <table class="bom">
        <thead><tr>
          <th style="width:24px">No.</th>
          <th style="width:56px">Image</th>
          <th>Item</th>
          <th>Description / Specification</th>
          <th style="width:34px;text-align:center">Qty</th>
          <th style="width:34px;text-align:center">Unit</th>
          <th style="width:94px;text-align:right">Rate (UGX)</th>
          <th style="width:102px;text-align:right">Amount (UGX)</th>
        </tr></thead>
        <tbody>${rows}${totalsHtml}</tbody>
      </table>
      ${notes ? `<div style="margin-top:10px;padding:7px 10px;background:#f7f9f7;border:1px solid #e0e5e2;font-size:10.5px;color:#555f59"><strong style="color:#1d2f25">Notes: </strong>${notes}</div>` : ''}
      <div class="sigs">
        <div><div class="sig-line"><span>Client&apos;s signature &amp; date</span><i></i></div><strong>${name || 'Client name'}</strong></div>
        <div><div class="sig-line"><span>Authorised by</span><i></i></div><strong>For and on behalf of TCOIN Solar Uganda</strong></div>
      </div>
      <footer><strong>We Plan and Do . . . .</strong><span>E&amp;OE &middot; All figures are estimates pending site assessment &middot; TCOIN Solar Uganda</span></footer>
      <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};</script>
    </body></html>`);
    win.document.close();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post(
        '/leads',
        {
          source: 'portal_free_quote',
          name,
          email,
          phone,
          notes,
          ...(prefill
            ? {
                district: prefill.district,
                system_type: prefill.systemType,
                sizing: {
                  daily_wh: prefill.result.dailyWh,
                  array_kwp: prefill.result.arrayKwp,
                  panels: prefill.result.panels,
                  battery_kwh: prefill.result.batteryKwh,
                  inverter_kw: prefill.result.inverterKw,
                  price_low: prefill.result.priceLow,
                  price_high: prefill.result.priceHigh,
                },
                appliances: prefill.appliances,
              }
            : {}),
          lines: lines.map(({ particulars, spec, qty, unit, rate, amount, variantId }) => ({
            particulars,
            spec,
            qty,
            unit,
            rate,
            amount,
            variant_id: variantId,
          })),
        },
        withIdempotency(),
      );
      saveQuote({
        id: `sq-${Date.now()}`,
        ref,
        created_at: new Date().toISOString(),
        source: 'free_request',
        name,
        email,
        phone,
        notes,
        ...(prefill
          ? {
              district: prefill.district,
              system_type: prefill.systemType,
              system_type_label: prefill.systemType,
              appliances: prefill.appliances,
              sizing: prefill.result,
            }
          : { system_type_label: 'custom' }),
        lines: lines.map(({ particulars, spec, qty, unit, rate, amount }) => ({
          particulars,
          spec,
          qty,
          unit,
          rate,
          amount,
        })),
        subtotal,
        vat,
        total,
      });
      setSubmitted(true);
      onSaved?.();
    } catch {
      setError('Could not submit. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          padding: '48px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#eaf3b5',
            border: '2px solid #14723a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
          }}
        >
          ✅
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#1d2f25', fontFamily: 'Georgia,serif' }}>
          Quotation request sent!
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#69736d', maxWidth: 420, lineHeight: 1.6 }}>
          Our team will review your details and send a formal quotation to <strong>{email}</strong> within 24
          hours.
        </p>
        <button
          className="pt-btn-secondary"
          onClick={() => {
            setSubmitted(false);
            setLines(prefill ? buildDraftLines(prefill.result, allProducts) : []);
          }}
        >
          New request
        </button>
      </div>
    );
  }

  return (
    <>
      {picker && (
        <ProductPicker
          role={picker.role}
          products={picker.type ? allProducts.filter((p) => p.product_type === picker.type) : allProducts}
          onPick={(p) => swapFromCatalog(picker.lineId, p)}
          onClose={() => setPicker(null)}
        />
      )}

      <form
        onSubmit={submit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'DM Sans', sans-serif",
          color: '#18201b',
        }}
      >
        {/* ── Letterhead masthead ── */}
        <div style={{ padding: '22px 28px 0', background: '#fff' }}>
          <header className="qr-masthead">
            <div className="qr-logo-lockup">
              <img
                src="/brand/TCOIN%20LOGO%20OFFICIAL.svg"
                alt="TCOIN"
                className="qr-logo-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/brand/logo.png';
                }}
              />
              <span className="qr-tagline">CENTER OF INNOVATIONS</span>
            </div>
            <div className="qr-masthead-center">
              <strong>TCOIN Solar Uganda</strong>
              <span>We Plan and Do</span>
            </div>
            <div className="qr-company-details">
              <strong>Nabulagala — near Kasubi Royal Tombs</strong>
              <span>P.O. Box 500273, Kampala, Uganda</span>
              <span>Tel: 0779 116 709 · 0705 998 786 · 0705 111 123</span>
              <span>info.tcoinug@gmail.com · www.tcoinug.com</span>
            </div>
          </header>
          <div className="qr-brand-stripe">
            <span />
          </div>
          <section className="qr-services">
            <p>Solar design, inspection, installation, maintenance and consultancy</p>
            <p>Electrical installations, system design, inspection and maintenance</p>
            <p>Supply of electrical, electronic and solar installation materials</p>
          </section>
        </div>

        {/* ── Party grid: client block + document title block ── */}
        <div style={{ padding: '10px 28px 0' }}>
          <section className="qr-party-grid">
            <div className="qr-client-block">
              <p
                className="qr-block-label"
                style={{
                  fontSize: 19,
                  fontFamily: 'Georgia, serif',
                  color: '#1d2f25',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: 10,
                }}
              >
                Prepared for
              </p>
              {[
                ['Client name', name?.trim() || '—'],
                ['District', prefill ? `${prefill.district}, Uganda` : '—'],
                ['System type', prefill ? (SYSTEM_LABEL[prefill.systemType] ?? prefill.systemType) : '—'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 13, lineHeight: 2 }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                      color: '#1d2f25',
                      whiteSpace: 'nowrap',
                      width: 100,
                      flexShrink: 0,
                    }}
                  >
                    {label}:
                  </span>
                  <span style={{ color: '#1d2f25', fontWeight: 500, fontSize: 14 }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="qr-invoice-block">
              <h1>Free Quotation Request</h1>
              <dl>
                <div>
                  <dt>Ref.</dt>
                  <dd style={{ fontSize: 11, fontWeight: 700 }}>{ref}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{issueDate}</dd>
                </div>
                <div>
                  <dt>Validity</dt>
                  <dd>30 days from date of issue</dd>
                </div>
                <div>
                  <dt>Prepared by</dt>
                  <dd>TCOIN Solar Uganda</dd>
                </div>
              </dl>
            </div>
          </section>
        </div>

        {/* ── Sizing context banner ── */}
        {prefill && (
          <div
            style={{
              margin: '10px 28px 0',
              padding: '10px 14px',
              background: '#f0faf4',
              border: '1px solid #14723a',
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: '#14723a',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Based on your sizing:
            </span>
            {[
              `${prefill.result.arrayKwp} kWp array`,
              `${prefill.result.panels} panels`,
              prefill.result.batteryKwh > 0 ? `${prefill.result.batteryKwh} kWh battery` : null,
              `${prefill.result.inverterKw} kW inverter`,
              prefill.district,
              prefill.systemType.replace('_', '-'),
            ]
              .filter(Boolean)
              .map((v) => (
                <span
                  key={v}
                  style={{
                    fontSize: 11,
                    background: '#fff',
                    border: '1px solid #14723a',
                    padding: '2px 10px',
                    color: '#1d2f25',
                    fontWeight: 600,
                  }}
                >
                  {v}
                </span>
              ))}
          </div>
        )}

        {/* ── Section 1: Contact details ── */}
        <div style={{ margin: '14px 28px 0', border: '1px solid #28312c' }}>
          <div
            style={{
              padding: '6px 12px',
              background: '#f1f4f1',
              borderBottom: '1px solid #28312c',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#173b28',
                color: '#eaf3b5',
                fontSize: 10,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              1
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#293269',
              }}
            >
              Fill in your Contact details
            </span>
          </div>
          <div
            style={{
              padding: '14px 16px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px 24px',
            }}
          >
            <div className="pt-field">
              <label className="pt-label">Full name *</label>
              <input
                className="pt-input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="pt-field">
              <label className="pt-label">Email address *</label>
              <input
                className="pt-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="pt-field">
              <label className="pt-label">Phone number</label>
              <input
                className="pt-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 700 000 000"
              />
            </div>
            <div className="pt-field">
              <label className="pt-label">Notes / site address</label>
              <input
                className="pt-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Site address, special requirements…"
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Quote lines ── */}
        <div style={{ margin: '14px 28px 0', border: '1px solid #28312c' }}>
          <div
            style={{
              padding: '6px 12px',
              background: '#f1f4f1',
              borderBottom: '1px solid #28312c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#173b28',
                  color: '#eaf3b5',
                  fontSize: 10,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                2
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#293269',
                }}
              >
                Quote lines
              </span>
            </div>
            <button type="button" className="pt-btn-secondary pt-btn-sm" onClick={addBlankLine}>
              + Add line
            </button>
          </div>

          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: COL,
              background: '#f1f4f1',
              borderBottom: '1px solid #28312c',
            }}
          >
            {[
              'Item / Particulars',
              'Specification',
              'Image',
              'Qty',
              'Unit',
              'Rate (UGX)',
              'Amount (UGX)',
              'Source',
              '',
            ].map((h) => (
              <div
                key={h}
                style={{
                  padding: '7px 10px',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#293269',
                  borderRight: '1px solid #e0e5e2',
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {lines.length === 0 && (
            <div
              style={{
                padding: 24,
                textAlign: 'center',
                fontSize: 13,
                color: '#9ba19d',
                borderBottom: '1px solid #e0e5e2',
              }}
            >
              No lines yet — click "+ Add line" or come from "Size a System".
            </div>
          )}

          {lines.map((l, idx) => {
            const productType =
              l.id === 'l-panels'
                ? 'panel'
                : l.id === 'l-inverter'
                  ? 'inverter'
                  : l.id === 'l-battery'
                    ? 'battery'
                    : l.id === 'l-mount'
                      ? 'mounting'
                      : l.id === 'l-dc10'
                        ? 'cable'
                        : typeFromParticulars(l.particulars);
            return (
              <div
                key={l.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: COL,
                  borderBottom: '1px solid #e0e5e2',
                  background: l.particulars.startsWith('⚠') ? '#fff8f0' : idx % 2 === 0 ? '#fff' : '#fafbfa',
                }}
              >
                <div style={{ padding: '4px 6px', borderRight: '1px solid #e0e5e2' }}>
                  {l.particulars.startsWith('⚠') ? (
                    <span style={{ fontSize: 11, color: '#d92c32', fontWeight: 700 }}>{l.particulars}</span>
                  ) : (
                    <input
                      className="pt-input"
                      style={{ height: 32, fontSize: 12, width: '100%' }}
                      value={l.particulars}
                      placeholder="Item name"
                      onChange={(e) => updateLine(l.id, 'particulars', e.target.value)}
                    />
                  )}
                </div>
                <div style={{ padding: '4px 6px', borderRight: '1px solid #e0e5e2' }}>
                  <input
                    className="pt-input"
                    style={{ height: 32, fontSize: 11, width: '100%' }}
                    value={l.spec}
                    placeholder="Specification"
                    onChange={(e) => updateLine(l.id, 'spec', e.target.value)}
                  />
                </div>
                {/* Image cell */}
                <div
                  style={{
                    padding: '4px 6px',
                    borderRight: '1px solid #e0e5e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                  }}
                >
                  {l.imageUrl ? (
                    <>
                      <img
                        src={l.imageUrl}
                        alt=""
                        style={{ width: 46, height: 38, objectFit: 'cover', border: '1px solid #e0e5e2' }}
                      />
                      <button
                        type="button"
                        onClick={() => updateLine(l.id, 'imageUrl', '')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#d92c32',
                          fontSize: 14,
                          lineHeight: 1,
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <label
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <span style={{ fontSize: 18, color: '#9ba19d' }}>🖼</span>
                      <span style={{ fontSize: 9, color: '#9ba19d', whiteSpace: 'nowrap' }}>Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          updateLine(l.id, 'imageUrl', URL.createObjectURL(file));
                        }}
                      />
                    </label>
                  )}
                </div>
                <div style={{ padding: '4px 6px', borderRight: '1px solid #e0e5e2' }}>
                  <input
                    className="pt-input"
                    style={{ height: 32, fontSize: 12, width: '100%', textAlign: 'center' }}
                    type="number"
                    min="0"
                    value={l.qty}
                    onChange={(e) => updateLine(l.id, 'qty', Number(e.target.value))}
                  />
                </div>
                <div style={{ padding: '4px 6px', borderRight: '1px solid #e0e5e2' }}>
                  <input
                    className="pt-input"
                    style={{ height: 32, fontSize: 12, width: '100%', textAlign: 'center' }}
                    value={l.unit}
                    onChange={(e) => updateLine(l.id, 'unit', e.target.value)}
                  />
                </div>
                <div style={{ padding: '4px 6px', borderRight: '1px solid #e0e5e2' }}>
                  <input
                    className="pt-input"
                    style={{ height: 32, fontSize: 12, width: '100%', textAlign: 'right' }}
                    type="number"
                    min="0"
                    value={l.rate}
                    onChange={(e) => updateLine(l.id, 'rate', Number(e.target.value))}
                  />
                </div>
                <div
                  style={{
                    padding: '8px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: l.amount > 0 ? '#1d2f25' : '#9ba19d',
                    borderRight: '1px solid #e0e5e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  {l.amount > 0 ? fmt(l.amount) : '—'}
                </div>
                <div
                  style={{
                    padding: '4px 6px',
                    borderRight: '1px solid #e0e5e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {productType ? (
                    <button
                      type="button"
                      onClick={() => setPicker({ role: productType, type: productType, lineId: l.id })}
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '3px 7px',
                        border: `1px solid ${l.fromCatalog ? '#14723a' : l.particulars.startsWith('⚠') ? '#d92c32' : '#9ba19d'}`,
                        background: l.fromCatalog
                          ? '#eaf3b5'
                          : l.particulars.startsWith('⚠')
                            ? '#fff0f0'
                            : '#f1f4f1',
                        color: l.fromCatalog
                          ? '#14723a'
                          : l.particulars.startsWith('⚠')
                            ? '#d92c32'
                            : '#69736d',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {l.fromCatalog ? '✓ Catalog' : 'Pick →'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPicker({ role: 'product', type: '', lineId: l.id })}
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '3px 7px',
                        border: '1px solid #9ba19d',
                        background: '#f1f4f1',
                        color: '#69736d',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        width: '100%',
                      }}
                    >
                      🛒 Pick
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#d92c32',
                      fontSize: 18,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}

          {/* Totals */}
          {lines.length > 0 && (
            <div style={{ borderTop: '1px solid #e0e5e2' }}>
              {[
                { label: 'Subtotal', val: subtotal, bold: false },
                { label: 'VAT (18%)', val: vat, bold: false },
                { label: 'Total', val: total, bold: true },
              ].map(({ label, val, bold }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    borderTop: bold ? '2px solid #173b28' : '1px solid #e0e5e2',
                    background: bold ? '#f1f4f1' : '#fff',
                  }}
                >
                  <div
                    style={{
                      width: 280,
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 14px',
                      fontSize: bold ? 13 : 12,
                      fontWeight: bold ? 900 : 400,
                      color: bold ? '#1d2f25' : '#69736d',
                    }}
                  >
                    <span>{label}</span>
                    <span>UGX {fmt(val)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Signatures ── */}
        <div style={{ padding: '0 28px' }}>
          <section className="qr-signatures">
            <div>
              <div className="qr-sig-line">
                <span>Client's signature &amp; date</span>
                <i />
              </div>
              <strong>{name?.trim() || 'Client name'}</strong>
            </div>
            <div>
              <div className="qr-sig-line">
                <span>Authorised by</span>
                <i />
              </div>
              <strong>For and on behalf of TCOIN Solar Uganda</strong>
            </div>
          </section>
          <footer className="qr-footer">
            <strong>We Plan and Do . . . .</strong>
            <span>E&amp;OE · All figures are estimates pending site assessment · TCOIN Solar Uganda</span>
          </footer>
        </div>

        {/* ── Action bar ── */}
        <div
          className="fq-action-bar"
          style={{
            margin: '0 28px 28px',
            padding: '12px 16px',
            borderTop: '2px solid #173b28',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            background: '#f9faf9',
          }}
        >
          <p style={{ margin: 0, fontSize: 11, color: '#9ba19d', fontStyle: 'italic' }}>
            E&amp;OE · All figures are indicative pending site assessment.
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {error && <span style={{ fontSize: 12, color: '#d92c32', fontWeight: 700 }}>{error}</span>}
            {saved && (
              <span style={{ fontSize: 12, color: '#14723a', fontWeight: 700 }}>✓ Saved locally</span>
            )}
            <button type="button" className="pt-btn-secondary" onClick={() => setPreview(true)}>
              👁 Preview
            </button>
            <button type="button" className="pt-btn-secondary" onClick={handlePrint}>
              🖨 Print
            </button>
            <button type="button" className="pt-btn-secondary" onClick={handleSave}>
              💾 Save
            </button>
            <button type="submit" className="pt-btn-primary" disabled={busy}>
              {busy ? 'Sending…' : 'Submit →'}
            </button>
          </div>
        </div>
      </form>

      {/* ── Preview modal ── */}
      {preview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(0,0,0,0.65)',
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreview(false);
          }}
        >
          <div
            style={{
              width: 'min(860px,98vw)',
              margin: '28px auto 48px',
              background: '#eef0ed',
              borderRadius: 4,
            }}
          >
            {/* toolbar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                background: '#173b28',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}
            >
              <span
                style={{
                  color: '#eaf3b5',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Preview — Free Quotation
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handlePrint}
                  style={{
                    padding: '5px 14px',
                    background: '#eaf3b5',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#173b28',
                  }}
                >
                  🖨 Print
                </button>
                <button
                  onClick={() => setPreview(false)}
                  style={{
                    padding: '5px 14px',
                    background: '#d92c32',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* A4 document */}
            <div
              className="fq-print-doc"
              style={{
                background: '#fff',
                padding: '32px 36px 28px',
                fontFamily: "'DM Sans',sans-serif",
                color: '#18201b',
              }}
            >
              {/* masthead */}
              <header className="qr-masthead">
                <div className="qr-logo-lockup">
                  <img
                    src="/brand/TCOIN%20LOGO%20OFFICIAL.svg"
                    alt="TCOIN"
                    className="qr-logo-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/brand/logo.png';
                    }}
                  />
                  <span className="qr-tagline">CENTER OF INNOVATIONS</span>
                </div>
                <div className="qr-masthead-center">
                  <strong>TCOIN Solar Uganda</strong>
                  <span>We Plan and Do</span>
                </div>
                <div className="qr-company-details">
                  <strong>Nabulagala — near Kasubi Royal Tombs</strong>
                  <span>P.O. Box 500273, Kampala, Uganda</span>
                  <span>Tel: 0779 116 709 · 0705 998 786 · 0705 111 123</span>
                  <span>info.tcoinug@gmail.com · www.tcoinug.com</span>
                </div>
              </header>
              <div className="qr-brand-stripe">
                <span />
              </div>
              <section className="qr-services">
                <p>Solar design, inspection, installation, maintenance and consultancy</p>
                <p>Electrical installations, system design, inspection and maintenance</p>
                <p>Supply of electrical, electronic and solar installation materials</p>
              </section>

              {/* party grid */}
              <section className="qr-party-grid" style={{ marginTop: 14 }}>
                <div className="qr-client-block">
                  <p className="qr-block-label">Prepared for</p>
                  {[
                    ['Client', name || '—'],
                    ['District', prefill ? `${prefill.district}, Uganda` : '—'],
                    ['System', prefill ? (SYSTEM_LABEL[prefill.systemType] ?? prefill.systemType) : '—'],
                    ['Phone', phone || '—'],
                    ['Email', email || '—'],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', gap: 6, fontSize: 11, lineHeight: 1.85 }}>
                      <span style={{ fontWeight: 800, width: 56, flexShrink: 0, color: '#69736d' }}>
                        {l}:
                      </span>
                      <span style={{ fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="qr-invoice-block">
                  <h1>Free Quotation</h1>
                  <dl>
                    <div>
                      <dt>Date</dt>
                      <dd>{issueDate}</dd>
                    </div>
                    <div>
                      <dt>Validity</dt>
                      <dd>30 days from issue</dd>
                    </div>
                    <div>
                      <dt>Prepared by</dt>
                      <dd>TCOIN Solar Uganda</dd>
                    </div>
                    {prefill && (
                      <div>
                        <dt>System size</dt>
                        <dd>
                          {prefill.result.arrayKwp} kWp · {prefill.result.panels} panels
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </section>

              {/* BOM table — No. | Image | Item | Description | Qty | Unit | Rate | Amount */}
              <div style={{ marginTop: 16, border: '1px solid #28312c', fontSize: 10.5 }}>
                {/* header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '28px 58px 1fr 1.4fr 36px 36px 96px 104px',
                    background: '#173b28',
                    color: '#eaf3b5',
                  }}
                >
                  {[
                    'No.',
                    'Image',
                    'Item',
                    'Description / Specification',
                    'Qty',
                    'Unit',
                    'Rate (UGX)',
                    'Amount (UGX)',
                  ].map((h) => (
                    <div
                      key={h}
                      style={{
                        padding: '6px 7px',
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        borderRight: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      {h}
                    </div>
                  ))}
                </div>

                {lines.map((l, i) => (
                  <div
                    key={l.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '28px 58px 1fr 1.4fr 36px 36px 96px 104px',
                      borderBottom: '1px solid #e0e5e2',
                      background: i % 2 === 0 ? '#fff' : '#f7f9f7',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        padding: '4px 6px',
                        textAlign: 'center',
                        borderRight: '1px solid #e0e5e2',
                        color: '#9ba19d',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div
                      style={{
                        padding: '4px 6px',
                        borderRight: '1px solid #e0e5e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {l.imageUrl ? (
                        <img
                          src={l.imageUrl}
                          alt=""
                          style={{
                            width: 48,
                            height: 40,
                            objectFit: 'cover',
                            border: '1px solid #e0e5e2',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 48,
                            height: 40,
                            background: '#f1f4f1',
                            border: '1px dashed #c8cfc9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            color: '#c8cfc9',
                          }}
                        >
                          🖼
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        padding: '6px 7px',
                        borderRight: '1px solid #e0e5e2',
                        fontWeight: 700,
                        fontSize: 11,
                        alignSelf: 'start',
                        paddingTop: 8,
                      }}
                    >
                      {l.particulars}
                    </div>
                    <div
                      style={{
                        padding: '6px 7px',
                        borderRight: '1px solid #e0e5e2',
                        color: '#555f59',
                        fontSize: 10,
                        lineHeight: 1.5,
                        alignSelf: 'start',
                      }}
                    >
                      {l.spec || '—'}
                    </div>
                    <div
                      style={{
                        padding: '6px 7px',
                        textAlign: 'center',
                        borderRight: '1px solid #e0e5e2',
                        fontWeight: 600,
                      }}
                    >
                      {l.qty}
                    </div>
                    <div
                      style={{
                        padding: '6px 7px',
                        textAlign: 'center',
                        borderRight: '1px solid #e0e5e2',
                        color: '#69736d',
                      }}
                    >
                      {l.unit}
                    </div>
                    <div style={{ padding: '6px 7px', textAlign: 'right', borderRight: '1px solid #e0e5e2' }}>
                      {l.rate > 0 ? fmt(l.rate) : '—'}
                    </div>
                    <div
                      style={{
                        padding: '6px 7px',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: l.amount > 0 ? '#1d2f25' : '#9ba19d',
                      }}
                    >
                      {l.amount > 0 ? fmt(l.amount) : '—'}
                    </div>
                  </div>
                ))}

                {/* totals */}
                <div style={{ borderTop: '2px solid #173b28' }}>
                  {[
                    { label: 'Subtotal', val: subtotal, bold: false },
                    { label: 'VAT (18%)', val: vat, bold: false },
                    { label: 'TOTAL', val: total, bold: true },
                  ].map(({ label, val, bold }) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        borderTop: bold ? 'none' : '1px solid #e0e5e2',
                        background: bold ? '#173b28' : '#fff',
                      }}
                    >
                      <div
                        style={{
                          width: 320,
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '7px 14px',
                          fontSize: bold ? 12 : 11,
                          fontWeight: bold ? 900 : 400,
                          color: bold ? '#eaf3b5' : '#69736d',
                        }}
                      >
                        <span>{label}</span>
                        <span>UGX {fmt(val)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* notes */}
              {notes && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '8px 12px',
                    background: '#f7f9f7',
                    border: '1px solid #e0e5e2',
                    fontSize: 11,
                    color: '#555f59',
                  }}
                >
                  <strong style={{ color: '#1d2f25' }}>Notes: </strong>
                  {notes}
                </div>
              )}

              {/* signatures */}
              <section className="qr-signatures" style={{ marginTop: 28 }}>
                <div>
                  <div className="qr-sig-line">
                    <span>Client's signature &amp; date</span>
                    <i />
                  </div>
                  <strong>{name || 'Client name'}</strong>
                </div>
                <div>
                  <div className="qr-sig-line">
                    <span>Authorised by</span>
                    <i />
                  </div>
                  <strong>For and on behalf of TCOIN Solar Uganda</strong>
                </div>
              </section>
              <footer className="qr-footer">
                <strong>We Plan and Do . . . .</strong>
                <span>E&amp;OE · All figures are estimates pending site assessment · TCOIN Solar Uganda</span>
              </footer>
            </div>
            {/* end doc */}
          </div>
        </div>
      )}
    </>
  );
}
