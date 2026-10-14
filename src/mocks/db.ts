import { PERMISSIONS } from '@/lib/permissions';
import { amountInWords } from '@/lib/amountInWords';
import type { Customer, Lead, Product, Quote, Receipt } from '@/types/api';
import {
  MOCK_PROJECTS,
  MOCK_MILESTONES,
  MOCK_ASSETS,
  MOCK_WARRANTIES,
  MOCK_INVOICES,
  MOCK_TICKETS,
  MOCK_ORDERS,
} from './fixtures/portal';

export interface MockUser {
  id: string;
  email: string;
  phone: string;
  password: string;
  full_name: string;
  avatar?: string | null;
  user_type: 'staff' | 'customer';
  customer_id: string | null;
  roles: string[];
  permissions: string[];
  mfa?: boolean;
}

const sampleQuote = (): Quote => ({
  id: 'q-0248',
  quote_no: 'QT-2026-000118',
  proforma_no: '0248',
  customer_id: 'c1',
  status: 'sent',
  currency: 'UGX',
  document_title: 'Quotation for the Solar Lithium Phosphate battery',
  bill_to_text: 'Mr. BENJAMIN PATRICK M',
  issued_on: '2026-10-07',
  validity_days: 30,
  valid_until: '2026-11-06',
  show_eoe: true,
  show_images: true,
  discount_pct: 0,
  subtotal: 2900000,
  discount_amount: 0,
  total: 2900000,
  amount_in_words: amountInWords(2900000),
  signatory_name: 'KAYEERA NATHAN',
  created_at: '2026-10-07T08:00:00Z',
  lines: [
    {
      line_no: 1,
      variant_id: 'v-bat5',
      particulars: 'Solar Lithium Iron Battery',
      specification:
        'Lithium Battery, 24V, 200AH, 5kWh. Recommended Output Power=2000W (6000 cycles with DOD80%)',
      quantity: 1,
      unit: 'pc',
      rate: 2900000,
      amount: 2900000,
    },
  ],
});

const seed = () => ({
  users: [
    {
      id: 'u-admin',
      email: 'admin@tcoinug.com',
      phone: '+256779116709',
      password: 'Admin@123',
      full_name: 'Kayeera Nathan',
      avatar: '/profile/kayeera-nathan.png',
      user_type: 'staff',
      customer_id: null,
      roles: ['admin'],
      permissions: [...PERMISSIONS],
    },
    {
      id: 'u-mfa',
      email: 'mfa@tcoinug.com',
      phone: '+256705998786',
      password: 'Admin@123',
      full_name: 'MFA Officer',
      avatar: null,
      user_type: 'staff',
      customer_id: null,
      roles: ['finance'],
      permissions: ['billing.write', 'reports.read', 'receipts.issue'],
      mfa: true,
    },
    {
      id: 'u-sarah',
      email: 'sarah@example.com',
      phone: '+256700111222',
      password: 'Customer@123',
      full_name: 'Sarah N.',
      avatar: null,
      user_type: 'customer',
      customer_id: 'c1',
      roles: ['customer'],
      permissions: [],
    },
  ] as MockUser[],
  customers: [
    {
      id: 'c1',
      customer_no: 'CUS-2026-000045',
      customer_type: 'individual',
      display_name: 'Mr. Benjamin Patrick M',
      phone: '+256 700 000 000',
      email: 'benjamin@example.com',
    },
    {
      id: 'c2',
      customer_no: 'CUS-2026-000046',
      customer_type: 'business',
      display_name: 'Mukasa Ltd',
      phone: '+256 701 000 111',
    },
    {
      id: 'c3',
      customer_no: 'CUS-2026-000047',
      customer_type: 'institution',
      display_name: 'Green School',
      phone: '+256 702 000 222',
    },
  ] as Customer[],
  products: [
    {
      id: 'p1',
      slug: 'mono-panel-550w',
      product_type: 'panel',
      category: 'panels',
      brand: 'Jinko Solar',
      name: 'Mono Panel 550W',
      warranty_months: 300,
      spec_text: 'Mono PERC 550 W, 2278 x 1134 mm',
      variants: [
        {
          id: 'v-pv550',
          sku: 'PV-550',
          name: 'Single panel',
          unit: 'pc',
          price: { amount: '420000.00', currency: 'UGX' },
          available_qty: 60,
        },
      ],
    },
    {
      id: 'p2',
      slug: 'hybrid-inverter-8kw',
      product_type: 'inverter',
      category: 'inverters',
      brand: 'Growatt',
      name: 'Hybrid Inverter 8kW',
      warranty_months: 24,
      spec_text: '8 kW, 48 V battery, 2 MPPT, 500 V DC max',
      variants: [
        {
          id: 'v-inv8',
          sku: 'INV-8K',
          name: 'Standard',
          unit: 'pc',
          price: { amount: '6200000.00', currency: 'UGX' },
          available_qty: 4,
        },
      ],
    },
    {
      id: 'p3',
      slug: 'lithium-battery-5kwh',
      product_type: 'battery',
      category: 'batteries',
      brand: 'BYD',
      name: 'Solar Lithium Iron Battery 5kWh',
      warranty_months: 120,
      spec_text: 'Lithium Battery, 24V, 200AH, 5kWh, 6000 cycles at 80% DoD',
      variants: [
        {
          id: 'v-bat5',
          sku: 'BAT-5K',
          name: 'Single unit',
          unit: 'pc',
          price: { amount: '2900000.00', currency: 'UGX' },
          available_qty: 5,
        },
      ],
    },
    {
      id: 'p4',
      slug: 'dc-solar-cable-6mm',
      product_type: 'cable',
      category: 'accessories',
      brand: 'Helukabel',
      name: 'DC Solar Cable 6mm² (per metre)',
      warranty_months: 0,
      spec_text: 'Red/black, UV resistant, per metre',
      variants: [
        {
          id: 'v-cbl6',
          sku: 'CBL-6',
          name: 'Per metre',
          unit: 'm',
          price: { amount: '9500.00', currency: 'UGX' },
          available_qty: 500,
        },
      ],
    },
    {
      id: 'p5',
      slug: 'mounting-kit-12panel',
      product_type: 'mounting',
      category: 'mounting',
      brand: 'TCOIN Solar',
      name: 'Roof Mounting Kit (12 panels)',
      warranty_months: 60,
      spec_text: 'Aluminium rails and clamps for 12 panels',
      variants: [
        {
          id: 'v-mnt',
          sku: 'MNT-01',
          name: 'Complete kit',
          unit: 'set',
          price: { amount: '900000.00', currency: 'UGX' },
          available_qty: 21,
        },
      ],
    },
    {
      id: 'p6',
      slug: 'mppt-charge-controller-60a',
      product_type: 'charge_controller',
      category: 'controllers',
      brand: 'EPever',
      name: 'MPPT Charge Controller 60A',
      warranty_months: 12,
      spec_text: 'MPPT 60 A, 12/24/48 V',
      variants: [
        {
          id: 'v-mppt',
          sku: 'MPPT-60',
          name: 'Standard',
          unit: 'pc',
          price: { amount: '780000.00', currency: 'UGX' },
          available_qty: 9,
        },
      ],
    },
    {
      id: 'p7',
      slug: 'canadian-solar-370w',
      product_type: 'panel',
      category: 'panels',
      brand: 'Canadian Solar',
      name: '370W Polycrystalline Panel',
      warranty_months: 120,
      spec_text: 'Poly 370W, 1960×992mm',
      variants: [
        {
          id: 'v-cs370',
          sku: 'CS-370W',
          name: 'Single panel',
          unit: 'pc',
          price: { amount: '620000.00', currency: 'UGX' },
          available_qty: 30,
        },
      ],
    },
    {
      id: 'p8',
      slug: 'victron-multiplus-3kva',
      product_type: 'inverter',
      category: 'inverters',
      brand: 'Victron Energy',
      name: '3kVA Inverter/Charger',
      warranty_months: 60,
      spec_text: '3000VA/2400W, 48V, 96% efficiency',
      variants: [
        {
          id: 'v-vic3k',
          sku: 'VIC-MP3K',
          name: 'Standard',
          unit: 'pc',
          price: { amount: '4800000.00', currency: 'UGX' },
          available_qty: 5,
        },
      ],
    },
    {
      id: 'p9',
      slug: 'trojan-t105-6v',
      product_type: 'battery',
      category: 'batteries',
      brand: 'Trojan',
      name: '225Ah Flooded Lead-Acid Battery',
      warranty_months: 12,
      spec_text: '225Ah, 6V, flooded lead-acid',
      variants: [
        {
          id: 'v-trj',
          sku: 'TRJ-T105',
          name: 'Single battery',
          unit: 'pc',
          price: { amount: '680000.00', currency: 'UGX' },
          available_qty: 24,
        },
      ],
    },
    {
      id: 'p10',
      slug: 'mc4-connector-pair',
      product_type: 'accessory',
      category: 'accessories',
      brand: 'Stäubli',
      name: 'MC4 Connector Pair (IP68)',
      warranty_months: 0,
      spec_text: 'IP68, 30A, 1500V DC',
      variants: [
        {
          id: 'v-mc4',
          sku: 'MC4-PAIR',
          name: 'Pair (M+F)',
          unit: 'pair',
          price: { amount: '12000.00', currency: 'UGX' },
          available_qty: 200,
        },
      ],
    },
    {
      id: 'p11',
      slug: 'solar-water-pump-2hp',
      product_type: 'pump',
      category: 'pumps',
      brand: 'Lorentz',
      name: '2HP Solar Water Pump System',
      warranty_months: 24,
      spec_text: '1500W, 80m head, 5.5m³/h',
      variants: [
        {
          id: 'v-lrz',
          sku: 'LRZ-PS2',
          name: 'Complete system',
          unit: 'set',
          price: { amount: '6800000.00', currency: 'UGX' },
          available_qty: 4,
        },
      ],
    },
    {
      id: 'p12',
      slug: 'battery-cabinet-48v',
      product_type: 'mounting',
      category: 'mounting',
      brand: 'TCOIN Solar',
      name: '48V Battery Enclosure Cabinet',
      warranty_months: 24,
      spec_text: 'Powder-coated steel, 4–8 batteries, ventilated',
      variants: [
        {
          id: 'v-cab',
          sku: 'TCS-BAT-CAB',
          name: 'Standard',
          unit: 'pc',
          price: { amount: '780000.00', currency: 'UGX' },
          available_qty: 6,
        },
      ],
    },
  ] as Product[],
  leads: [
    {
      id: 'l1',
      lead_no: 'LD-2026-000101',
      full_name: 'M. Okello',
      phone: '+256 700 111 111',
      location: 'Kampala',
      service_interest: 'design',
      status: 'new',
      created_at: '2026-10-09T10:00:00Z',
    },
    {
      id: 'l2',
      lead_no: 'LD-2026-000102',
      full_name: 'S. Nakato',
      phone: '+256 700 222 222',
      location: 'Entebbe',
      service_interest: 'installation',
      status: 'survey_scheduled',
      created_at: '2026-10-08T10:00:00Z',
    },
    {
      id: 'l3',
      lead_no: 'LD-2026-000103',
      full_name: 'Green School',
      phone: '+256 702 000 222',
      location: 'Jinja',
      service_interest: 'installation',
      status: 'quoted',
      created_at: '2026-10-05T10:00:00Z',
    },
    {
      id: 'l4',
      lead_no: 'LD-2026-000104',
      full_name: 'Hill Clinic',
      phone: '+256 703 333 333',
      location: 'Mbarara',
      service_interest: 'components',
      status: 'negotiating',
      created_at: '2026-10-03T10:00:00Z',
    },
  ] as Lead[],
  quotes: [sampleQuote()] as Quote[],
  receipts: [] as Receipt[],
  projects: MOCK_PROJECTS.map((p) => ({ ...p, customer_id: 'c1' })),
  milestones: MOCK_MILESTONES,
  assets: MOCK_ASSETS.map((a) => ({ ...a, customer_id: 'c1' })),
  warranties: MOCK_WARRANTIES,
  invoices: MOCK_INVOICES.map((i) => ({ ...i, customer_id: 'c1' })),
  tickets: MOCK_TICKETS.map((t) => ({ ...t, customer_id: 'c1' })),
  orders: MOCK_ORDERS.map((o) => ({ ...o, customer_id: 'c1' })),
  series: { proforma: 248, corporate: 0, cash_sales: 0, quote: 118, lead: 104 } as Record<string, number>,
});

export let db = seed();
export const resetDb = () => {
  db = seed();
};
export const nextNumber = (key: string, pad = 4): string => {
  db.series[key] = (db.series[key] ?? 0) + 1;
  return String(db.series[key]).padStart(pad, '0');
};
