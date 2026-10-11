export const MOCK_QUOTES = [
  {
    id: 'q1',
    quote_no: 'QT-2025-001',
    status: 'sent',
    valid_until: '2025-08-30',
    currency: 'UGX',
    version: {
      lines: [
        {
          line_no: 1,
          particulars: '400W Monocrystalline Solar Panel',
          specification: 'Jinko Tiger Neo',
          quantity: 8,
          unit: 'pcs',
          rate: 850000,
          amount: 6800000,
        },
        {
          line_no: 2,
          particulars: '5kVA Hybrid Inverter',
          specification: 'Growatt SPF 5000',
          quantity: 1,
          unit: 'pcs',
          rate: 3200000,
          amount: 3200000,
        },
        {
          line_no: 3,
          particulars: '200Ah Lithium Battery',
          specification: 'BYD LFP',
          quantity: 4,
          unit: 'pcs',
          rate: 1800000,
          amount: 7200000,
        },
        {
          line_no: 4,
          particulars: 'Installation & Commissioning',
          specification: 'Labour + materials',
          quantity: 1,
          unit: 'lot',
          rate: 1500000,
          amount: 1500000,
        },
      ],
      subtotal: { amount: '18700000', currency: 'UGX' },
      discount_amount: { amount: '700000', currency: 'UGX' },
      tax_amount: { amount: '1800000', currency: 'UGX' },
      total: { amount: '19800000', currency: 'UGX' },
    },
  },
  {
    id: 'q2',
    quote_no: 'QT-2025-002',
    status: 'draft',
    valid_until: '2025-09-15',
    currency: 'UGX',
    version: {
      lines: [
        {
          line_no: 1,
          particulars: '300W Solar Panel',
          specification: 'Canadian Solar',
          quantity: 6,
          unit: 'pcs',
          rate: 650000,
          amount: 3900000,
        },
        {
          line_no: 2,
          particulars: '3kVA Inverter',
          specification: 'Victron MultiPlus',
          quantity: 1,
          unit: 'pcs',
          rate: 2100000,
          amount: 2100000,
        },
      ],
      subtotal: { amount: '6000000', currency: 'UGX' },
      discount_amount: { amount: '0', currency: 'UGX' },
      tax_amount: { amount: '1080000', currency: 'UGX' },
      total: { amount: '7080000', currency: 'UGX' },
    },
  },
  {
    id: 'q3',
    quote_no: 'QT-2024-089',
    status: 'accepted',
    valid_until: '2025-01-10',
    currency: 'UGX',
    version: {
      lines: [
        {
          line_no: 1,
          particulars: 'Solar Water Pump System',
          specification: '2HP submersible',
          quantity: 1,
          unit: 'set',
          rate: 4500000,
          amount: 4500000,
        },
      ],
      subtotal: { amount: '4500000', currency: 'UGX' },
      discount_amount: { amount: '0', currency: 'UGX' },
      tax_amount: { amount: '810000', currency: 'UGX' },
      total: { amount: '5310000', currency: 'UGX' },
    },
  },
];

export const MOCK_PROJECTS = [
  {
    id: 'p1',
    project_no: 'PRJ-2025-001',
    name: 'Residential 8kW System – Kololo',
    status: 'active',
    progress_pct: 65,
    start_planned: '2025-06-01',
    end_planned: '2025-07-15',
    contract_value: { amount: '19800000', currency: 'UGX' },
    manager_id: 'usr_staff_001',
  },
  {
    id: 'p2',
    project_no: 'PRJ-2024-089',
    name: 'Solar Water Pump – Mukono Farm',
    status: 'completed',
    progress_pct: 100,
    start_planned: '2024-11-01',
    end_planned: '2024-12-20',
    contract_value: { amount: '5310000', currency: 'UGX' },
    manager_id: 'usr_staff_001',
  },
];

export const MOCK_MILESTONES: Record<string, object[]> = {
  p1: [
    { id: 'm1', seq: 1, name: 'Site survey & design approval', due_date: '2025-06-05', status: 'done' },
    { id: 'm2', seq: 2, name: 'Equipment procurement', due_date: '2025-06-15', status: 'done' },
    { id: 'm3', seq: 3, name: 'Mounting structure installation', due_date: '2025-06-25', status: 'done' },
    {
      id: 'm4',
      seq: 4,
      name: 'Panel & inverter installation',
      due_date: '2025-07-05',
      status: 'in_progress',
    },
    { id: 'm5', seq: 5, name: 'Commissioning & handover', due_date: '2025-07-15', status: 'pending' },
  ],
  p2: [
    { id: 'm6', seq: 1, name: 'Site assessment', due_date: '2024-11-05', status: 'done' },
    { id: 'm7', seq: 2, name: 'Pump installation', due_date: '2024-11-20', status: 'done' },
    { id: 'm8', seq: 3, name: 'System commissioning', due_date: '2024-12-10', status: 'done' },
    { id: 'm9', seq: 4, name: 'Customer training & handover', due_date: '2024-12-20', status: 'done' },
  ],
};

export const MOCK_ASSETS = [
  {
    id: 'a1',
    asset_no: 'AST-001',
    name: '8kW Hybrid Solar System',
    asset_type: 'solar_system',
    serial_no: 'GRW-5K-20250715',
    installed_at: '2025-07-15',
    status: 'active',
  },
  {
    id: 'a2',
    asset_no: 'AST-002',
    name: 'Solar Water Pump 2HP',
    asset_type: 'water_pump',
    serial_no: 'SWP-2HP-20241220',
    installed_at: '2024-12-20',
    status: 'active',
  },
];

export const MOCK_WARRANTIES: Record<string, object[]> = {
  a1: [
    {
      id: 'w1',
      coverage_type: 'panel_product',
      starts_on: '2025-07-15',
      ends_on: '2037-07-15',
      effective_status: 'active',
      days_remaining: 4383,
    },
    {
      id: 'w2',
      coverage_type: 'inverter_parts',
      starts_on: '2025-07-15',
      ends_on: '2030-07-15',
      effective_status: 'active',
      days_remaining: 1826,
    },
    {
      id: 'w3',
      coverage_type: 'workmanship',
      starts_on: '2025-07-15',
      ends_on: '2027-07-15',
      effective_status: 'active',
      days_remaining: 730,
    },
  ],
  a2: [
    {
      id: 'w4',
      coverage_type: 'pump_parts',
      starts_on: '2024-12-20',
      ends_on: '2027-12-20',
      effective_status: 'active',
      days_remaining: 912,
    },
    {
      id: 'w5',
      coverage_type: 'workmanship',
      starts_on: '2024-12-20',
      ends_on: '2026-12-20',
      effective_status: 'active',
      days_remaining: 182,
    },
  ],
};

export const MOCK_INVOICES = [
  {
    id: 'inv1',
    invoice_no: 'INV-2025-0041',
    issue_date: '2025-07-15',
    due_date: '2025-08-14',
    total: { amount: '19800000', currency: 'UGX' },
    balance: { amount: '9900000', currency: 'UGX' },
    payment_state: 'partial',
  },
  {
    id: 'inv2',
    invoice_no: 'INV-2024-0089',
    issue_date: '2024-12-20',
    due_date: '2025-01-19',
    total: { amount: '5310000', currency: 'UGX' },
    balance: { amount: '0', currency: 'UGX' },
    payment_state: 'paid',
  },
];

export const MOCK_ORDERS = [
  {
    id: 'ord1',
    order_no: 'ORD-2025-0012',
    status: 'delivered',
    placed_at: '2025-06-10',
    total: { amount: '320000', currency: 'UGX' },
  },
  {
    id: 'ord2',
    order_no: 'ORD-2025-0031',
    status: 'processing',
    placed_at: '2025-07-18',
    total: { amount: '185000', currency: 'UGX' },
  },
];

export const MOCK_TICKETS = [
  {
    id: 'tkt1',
    ticket_no: 'TKT-2025-0018',
    subject: 'Inverter showing low battery warning',
    category: 'Fault',
    priority: 'high',
    status: 'responded',
    description:
      'The inverter display shows a low battery warning even when the sun is shining. System was installed 2 weeks ago.',
    sla_response_due: '2025-07-20T10:00:00Z',
    sla_resolution_due: '2025-07-22T10:00:00Z',
  },
  {
    id: 'tkt2',
    ticket_no: 'TKT-2025-0009',
    subject: 'Request for maintenance visit',
    category: 'Other',
    priority: 'low',
    status: 'closed',
    description: 'Annual maintenance check requested.',
    sla_response_due: '2025-05-10T10:00:00Z',
    sla_resolution_due: '2025-05-12T10:00:00Z',
  },
];
