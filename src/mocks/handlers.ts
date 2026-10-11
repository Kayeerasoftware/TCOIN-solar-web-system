import { http, HttpResponse } from 'msw';
import { env } from '@/lib/env';
import { FALLBACK_PROFILE } from '@/config/companyProfile';
import {
  MOCK_CREDENTIALS,
  MOCK_TOKENS,
  MOCK_MFA_TOKENS,
  MOCK_STAFF_USER,
  MFA_TRIGGER_PASSWORD,
} from './fixtures/auth';
import {
  MOCK_QUOTES,
  MOCK_PROJECTS,
  MOCK_MILESTONES,
  MOCK_ASSETS,
  MOCK_WARRANTIES,
  MOCK_INVOICES,
  MOCK_ORDERS,
  MOCK_TICKETS,
} from './fixtures/portal';
import { MOCK_PRODUCTS, MOCK_STORE_ORDERS } from './fixtures/store';
import type { AuthUser } from '@/types/domain';

const base = env.VITE_API_URL;

/** Tracks the logged-in user for /me during a mock session. */
let currentUser: AuthUser = MOCK_STAFF_USER;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ok = (data: any, status = 200) => HttpResponse.json(data, { status });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const created = (data: any) => HttpResponse.json(data, { status: 201 });
const notFound = () => HttpResponse.json({ title: 'Not found', status: 404 }, { status: 404 });
const empty = (key = 'data') => HttpResponse.json({ [key]: [] });

export const handlers = [
  // ── Company & platform ──────────────────────────────────────────────────
  http.get(`${base}/company-profile`, () => ok(FALLBACK_PROFILE)),
  http.get(`${base}/amount-in-words`, () =>
    ok({ words: 'Two million nine hundred thousand shillings only' }),
  ),
  http.get(`${base}/signatories`, () =>
    ok({ data: [{ id: 'sig_1', display_name: 'John Doe', job_title: 'Director' }] }),
  ),
  http.get(`${base}/documents/templates`, () => ok({ data: [] })),
  http.get(`${base}/documents/verify/:code`, ({ params }) =>
    ok({
      doc_type: 'receipt',
      doc_no: `RCT-${params.code}`,
      doc_date: '2025-01-01',
      amount: '500000',
      currency: 'UGX',
      status: 'valid',
    }),
  ),
  http.get(`${base}/documents`, () => empty()),
  http.get(`${base}/documents/:id/download`, () => ok({ url: '#' })),
  http.get(`${base}/notifications`, () => empty()),
  http.patch(`${base}/notifications/:id`, () => ok({ id: 'n1' })),
  http.get(`${base}/settings/:key`, ({ params }) => ok({ key: params.key, value: '' })),
  http.put(`${base}/settings/:key`, () => ok({ message: 'Saved' })),
  http.get(`${base}/audit-log`, () => empty()),
  http.get(`${base}/reports/:name`, () => ok({ rows: [] })),

  // ── Auth ────────────────────────────────────────────────────────────────
  http.post(`${base}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { identifier: string; password: string };
    const user = MOCK_CREDENTIALS[body.identifier];
    if (!user) return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    if (body.password === MFA_TRIGGER_PASSWORD)
      return HttpResponse.json({ mfa_required: true, mfa_token: 'mock-mfa-token', expires_in: 300 });
    currentUser = user;
    return HttpResponse.json(MOCK_TOKENS);
  }),
  http.post(`${base}/auth/mfa/verify`, async ({ request }) => {
    const body = (await request.json()) as { mfa_token: string; code: string };
    if (body.mfa_token !== 'mock-mfa-token' || body.code !== '123456')
      return HttpResponse.json({ message: 'Invalid code' }, { status: 422 });
    return HttpResponse.json(MOCK_MFA_TOKENS);
  }),
  http.post(`${base}/auth/otp/request`, () => ok({ message: 'OTP sent' })),
  http.post(`${base}/auth/otp/verify`, async ({ request }) => {
    const body = (await request.json()) as { phone: string; code: string };
    if (body.code !== '123456') return HttpResponse.json({ message: 'Invalid code' }, { status: 422 });
    currentUser = MOCK_CREDENTIALS[body.phone] ?? MOCK_STAFF_USER;
    return ok(MOCK_TOKENS);
  }),
  http.get(`${base}/me`, () => ok(currentUser)),
  http.post(`${base}/auth/logout`, () => {
    currentUser = MOCK_STAFF_USER;
    return ok({ message: 'Logged out' });
  }),
  http.post(`${base}/auth/change-password`, () => ok({ message: 'Password updated' })),
  http.post(`${base}/auth/refresh`, () => ok(MOCK_TOKENS)),

  // ── Catalog ─────────────────────────────────────────────────────────────
  http.get(`${base}/catalog/products`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.toLowerCase() ?? '';
    const category = url.searchParams.get('category') ?? '';
    let results = MOCK_PRODUCTS;
    if (q)
      results = results.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    if (category) results = results.filter((p) => p.category === category);
    return ok({ data: results, total: results.length });
  }),
  http.get(`${base}/catalog/products/:id`, ({ params }) => {
    const p = MOCK_PRODUCTS.find((x) => x.slug === params.id || x.id === params.id);
    return p ? ok(p) : notFound();
  }),
  http.post(`${base}/catalog/products`, async ({ request }) =>
    created({ id: 'prod_new', ...((await request.json()) as object) }),
  ),
  http.patch(`${base}/catalog/products/:id`, async ({ request }) =>
    ok({ id: 'prod_1', ...((await request.json()) as object) }),
  ),
  http.get(`${base}/catalog/categories`, () =>
    ok({ data: [{ id: 'cat_1', slug: 'panels', name: 'Solar Panels', children: [] }] }),
  ),
  http.post(`${base}/catalog/imports`, () =>
    HttpResponse.json({ message: 'Import queued' }, { status: 202 }),
  ),
  http.get(`${base}/price-lists`, () =>
    ok({
      data: [{ id: 'pl_1', code: 'RETAIL', name: 'Retail', currency: 'UGX', customer_type: 'individual' }],
    }),
  ),

  // ── CRM ─────────────────────────────────────────────────────────────────
  http.get(`${base}/customers`, () => ok({ data: [] })),
  http.post(`${base}/customers`, async ({ request }) =>
    created({ id: 'cust_new', customer_no: 'CUST-001', ...((await request.json()) as object) }),
  ),
  http.get(`${base}/customers/:id`, ({ params }) =>
    ok({
      id: params.id,
      customer_no: 'CUST-001',
      display_name: 'Demo Customer',
      customer_type: 'individual',
    }),
  ),
  http.patch(`${base}/customers/:id`, async ({ request }) =>
    ok({ id: 'cust_1', ...((await request.json()) as object) }),
  ),
  http.get(`${base}/leads`, () => ok({ data: [] })),
  http.post(`${base}/leads`, async ({ request }) =>
    created({ id: 'lead_new', lead_no: 'LEAD-001', status: 'new', ...((await request.json()) as object) }),
  ),
  http.get(`${base}/leads/:id`, ({ params }) =>
    ok({ id: params.id, lead_no: 'LEAD-001', full_name: 'Demo Lead', status: 'new' }),
  ),
  http.patch(`${base}/leads/:id`, async ({ request }) =>
    ok({ id: 'lead_1', ...((await request.json()) as object) }),
  ),
  http.post(`${base}/leads/:id/convert`, () =>
    created({ customer_id: 'cust_new', opportunity_id: 'opp_new' }),
  ),
  http.get(`${base}/opportunities`, () => ok({ data: [] })),
  http.post(`${base}/activities`, async ({ request }) =>
    created({ id: 'act_new', ...((await request.json()) as object) }),
  ),
  http.post(`${base}/public/leads`, () => created({ id: 'lead_pub', lead_no: 'LEAD-PUB-001' })),
  http.post(`${base}/public/sizing/estimate`, async ({ request }) => {
    const body = (await request.json()) as { monthly_kwh?: number };
    return ok({
      dailyWh: ((body.monthly_kwh ?? 10) * 1000) / 30,
      arrayKwp: 2,
      panels: 4,
      batteryKwh: 5,
      inverterKw: 3,
      priceLow: 8000000,
      priceHigh: 12000000,
      annualSavings: 2400000,
      paybackYearsLow: 3,
      paybackYearsHigh: 5,
      disclaimer: 'Indicative estimate only.',
    });
  }),
  http.get(`${base}/public/services`, () => ok({ data: [] })),

  // ── Site surveys & designs ───────────────────────────────────────────────
  http.get(`${base}/site-surveys`, () => ok({ data: [] })),
  http.post(`${base}/site-surveys`, async ({ request }) =>
    created({ id: 'surv_new', survey_no: 'SRV-001', ...((await request.json()) as object) }),
  ),
  http.get(`${base}/designs`, () => ok({ data: [] })),
  http.post(`${base}/designs`, async ({ request }) =>
    created({ id: 'des_new', design_no: 'DES-001', status: 'draft', ...((await request.json()) as object) }),
  ),
  http.get(`${base}/designs/:id`, ({ params }) =>
    ok({
      id: params.id,
      design_no: 'DES-001',
      status: 'draft',
      system_type: 'hybrid',
      results: { energy: { dailyWh: 5000 }, array: { kwp: 3 }, battery: { kwh: 10 }, inverter: { kw: 5 } },
      warnings: [],
      overrides: {},
    }),
  ),
  http.patch(`${base}/designs/:id`, async ({ request }) =>
    ok({ id: 'des_1', ...((await request.json()) as object) }),
  ),
  http.get(`${base}/designs/:id/bom`, () => ok({ data: [] })),
  http.post(`${base}/sizing/calculate`, async () =>
    ok({ dailyWh: 5000, arrayKwp: 3, panels: 6, batteryKwh: 10, inverterKw: 5, bom: [], warnings: [] }),
  ),

  // ── Quotes ───────────────────────────────────────────────────────────────
  http.get(`${base}/quotes`, () => ok({ data: MOCK_QUOTES })),
  http.post(`${base}/quotes`, async ({ request }) =>
    created({
      id: 'q_new',
      quote_no: 'QT-2025-001',
      status: 'draft',
      current_version: 1,
      currency: 'UGX',
      ...((await request.json()) as object),
    }),
  ),
  http.get(`${base}/quotes/:id`, ({ params }) => {
    const q = MOCK_QUOTES.find((x) => x.id === params.id);
    return q ? ok(q) : notFound();
  }),
  http.get(`${base}/quotes/:id/versions`, () => ok({ data: [] })),
  http.post(`${base}/quotes/:id/versions`, async ({ request }) =>
    created({ id: 'qv_new', version_no: 2, ...((await request.json()) as object) }),
  ),
  http.post(`${base}/quotes/:id/submit-approval`, () => ok({ message: 'Submitted' }, 202)),
  http.post(`${base}/quotes/:id/send`, () => ok({ message: 'Sent' })),
  http.post(`${base}/quotes/:id/accept`, ({ params }) => {
    const q = MOCK_QUOTES.find((x) => x.id === params.id);
    if (q) (q as { status: string }).status = 'accepted';
    return ok({ message: 'Accepted' });
  }),
  http.get(`${base}/quotes/:id/pdf`, () => ok({ url: '#' })),
  http.post(`${base}/quotes/:id/proforma`, async () =>
    created({
      proforma_no: 'PI-2025-001',
      issued_on: new Date().toISOString().slice(0, 10),
      valid_until: '',
      document_id: 'doc_1',
      total: { amount: '2900000', currency: 'UGX' },
      amount_in_words: 'Two million nine hundred thousand shillings only',
    }),
  ),
  http.get(`${base}/quotes/:id/proforma/pdf`, () => ok({ url: '#' })),

  // ── Orders / store ───────────────────────────────────────────────────────
  http.get(`${base}/cart`, () =>
    ok({ id: 'cart_1', currency: 'UGX', items: [], subtotal: { amount: '0', currency: 'UGX' } }),
  ),
  http.put(`${base}/cart`, async ({ request }) =>
    ok({ id: 'cart_1', ...((await request.json()) as object) }),
  ),
  http.get(`${base}/orders`, () => ok({ data: MOCK_ORDERS })),
  http.post(`${base}/orders`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const id = `ord_${Date.now()}`;
    const order = {
      id,
      order_no: `ORD-2025-${String(Object.keys(MOCK_STORE_ORDERS).length + 100).padStart(4, '0')}`,
      status: 'confirmed',
      placed_at: new Date().toISOString(),
      total: { amount: '0', currency: 'UGX' },
      ...body,
    };
    MOCK_STORE_ORDERS[id] = order;
    return created(order);
  }),
  http.get(`${base}/orders/:id`, ({ params }) => {
    const id = params.id as string;
    const fromPortal = MOCK_ORDERS.find((o) => o.id === id);
    if (fromPortal) return ok(fromPortal);
    const fromStore = MOCK_STORE_ORDERS[id];
    return fromStore ? ok(fromStore) : notFound();
  }),
  http.post(`${base}/orders/:id/cancel`, () => ok({ message: 'Cancelled' })),
  http.post(`${base}/orders/:id/shipments`, async ({ request }) =>
    created({ id: 'ship_1', ...((await request.json()) as object) }),
  ),
  http.post(`${base}/returns`, async ({ request }) =>
    created({ id: 'ret_1', ...((await request.json()) as object) }),
  ),

  // ── Inventory ────────────────────────────────────────────────────────────
  http.get(`${base}/warehouses`, () =>
    ok({ data: [{ id: 'wh_1', code: 'KLA', name: 'Kampala Main', kind: 'warehouse' }] }),
  ),
  http.get(`${base}/stock`, () => ok({ data: [] })),
  http.get(`${base}/stock/movements`, () => ok({ data: [] })),
  http.post(`${base}/stock/movements`, async ({ request }) =>
    created({ id: 'mv_new', ...((await request.json()) as object) }),
  ),
  http.post(`${base}/stock/transfers`, async ({ request }) =>
    created({ id: 'tr_new', ...((await request.json()) as object) }),
  ),
  http.get(`${base}/serial-units/:serial`, ({ params }) =>
    ok({ serial_no: params.serial, status: 'in_stock', variant_id: 'var_1', warehouse_id: 'wh_1' }),
  ),
  http.get(`${base}/suppliers`, () =>
    ok({
      data: [
        {
          id: 'sup_1',
          code: 'SUP001',
          name: 'Solar Supplies Ltd',
          currency: 'UGX',
          contact: { email: 'info@supplier.ug' },
        },
      ],
    }),
  ),
  http.get(`${base}/purchase-orders`, () => ok({ data: [] })),
  http.post(`${base}/purchase-orders`, async ({ request }) =>
    created({ id: 'po_new', po_no: 'PO-2025-001', status: 'draft', ...((await request.json()) as object) }),
  ),
  http.post(`${base}/purchase-orders/:id/approve`, () => ok({ message: 'Approved' })),
  http.post(`${base}/purchase-orders/:id/receive`, async ({ request }) =>
    created({ id: 'grn_new', grn_no: 'GRN-2025-001', ...((await request.json()) as object) }),
  ),

  // ── Projects ─────────────────────────────────────────────────────────────
  http.get(`${base}/projects`, () => ok({ data: MOCK_PROJECTS })),
  http.get(`${base}/projects/:id`, ({ params }) => {
    const p = MOCK_PROJECTS.find((x) => x.id === params.id);
    return p ? ok(p) : notFound();
  }),
  http.patch(`${base}/projects/:id`, async ({ request }) =>
    ok({ id: 'proj_1', ...((await request.json()) as object) }),
  ),
  http.get(`${base}/projects/:id/milestones`, ({ params }) =>
    ok({ data: MOCK_MILESTONES[params.id as string] ?? [] }),
  ),
  http.get(`${base}/projects/:id/tasks`, () => ok({ data: [] })),
  http.post(`${base}/projects/:id/tasks`, async ({ request }) =>
    created({ id: 'task_new', ...((await request.json()) as object) }),
  ),
  http.put(`${base}/projects/:id/commissioning`, async ({ request }) =>
    ok({ id: 'comm_1', ...((await request.json()) as object) }),
  ),
  http.post(`${base}/projects/:id/handover`, () => created({ message: 'Handover complete' })),
  http.get(`${base}/schedule`, () => ok({ data: [] })),
  http.post(`${base}/schedule`, async ({ request }) =>
    created({ id: 'sched_new', ...((await request.json()) as object) }),
  ),

  // ── Field sync ───────────────────────────────────────────────────────────
  http.get(`${base}/sync/pull`, () => ok({ cursor: Date.now(), has_more: false, changes: {}, deleted: [] })),
  http.post(`${base}/sync/push`, () => ok({ results: [] })),
  http.post(`${base}/uploads/sign`, () => ok({ upload_url: '#', download_url: '#' })),

  // ── Maintenance ──────────────────────────────────────────────────────────
  http.get(`${base}/assets`, () => ok({ data: MOCK_ASSETS })),
  http.get(`${base}/assets/:id/warranties`, ({ params }) =>
    ok({ data: MOCK_WARRANTIES[params.id as string] ?? [] }),
  ),
  http.get(`${base}/service-contracts`, () => ok({ data: [] })),
  http.post(`${base}/service-contracts`, async ({ request }) =>
    created({ id: 'sc_new', contract_no: 'SC-001', ...((await request.json()) as object) }),
  ),
  http.get(`${base}/tickets`, () => ok({ data: MOCK_TICKETS })),
  http.post(`${base}/tickets`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    const ticket = {
      id: 'tkt_new',
      ticket_no: 'TKT-2025-0019',
      status: 'open',
      ...body,
      sla_response_due: new Date(Date.now() + 86400000).toISOString(),
      sla_resolution_due: new Date(Date.now() + 259200000).toISOString(),
    };
    MOCK_TICKETS.push(ticket as never);
    return created(ticket);
  }),
  http.get(`${base}/tickets/:id`, ({ params }) => {
    const t = MOCK_TICKETS.find((x) => x.id === params.id);
    return t ? ok(t) : notFound();
  }),
  http.patch(`${base}/tickets/:id`, async ({ request }) =>
    ok({ id: 'tkt_1', ...((await request.json()) as object) }),
  ),
  http.post(`${base}/tickets/:id/replies`, () => created({ id: 'reply_1', message: 'Reply received' })),
  http.get(`${base}/work-orders`, () => ok({ data: [] })),
  http.post(`${base}/work-orders`, async ({ request }) =>
    created({ id: 'wo_new', wo_no: 'WO-001', status: 'open', ...((await request.json()) as object) }),
  ),
  http.post(`${base}/work-orders/:id/complete`, async ({ request }) =>
    ok({ id: 'wo_1', status: 'completed', ...((await request.json()) as object) }),
  ),

  // ── Consultancy ──────────────────────────────────────────────────────────
  http.get(`${base}/consultation-services`, () =>
    ok({
      data: [
        {
          id: 'cs_1',
          code: 'CONSULT_1H',
          name: '1-Hour Solar Consultation',
          description: 'One-on-one session with a solar engineer.',
          duration_min: 60,
          price: { amount: '150000', currency: 'UGX' },
        },
      ],
    }),
  ),
  http.get(`${base}/availability`, () => ok({ slots: [] })),
  http.post(`${base}/bookings`, async ({ request }) =>
    created({
      id: 'bk_new',
      booking_no: 'BK-001',
      status: 'confirmed',
      ...((await request.json()) as object),
    }),
  ),
  http.get(`${base}/bookings`, () => ok({ data: [] })),
  http.get(`${base}/engagements`, () => ok({ data: [] })),
  http.post(`${base}/engagements/:id/deliverables`, async ({ request }) =>
    created({ id: 'del_new', ...((await request.json()) as object) }),
  ),

  // ── Billing ──────────────────────────────────────────────────────────────
  http.get(`${base}/invoices`, () => ok({ data: MOCK_INVOICES })),
  http.post(`${base}/invoices`, async ({ request }) =>
    created({
      id: 'inv_new',
      invoice_no: 'INV-2025-001',
      status: 'draft',
      payment_state: 'unpaid',
      ...((await request.json()) as object),
    }),
  ),
  http.get(`${base}/invoices/:id`, ({ params }) => {
    const inv = MOCK_INVOICES.find((x) => x.id === params.id);
    return inv ? ok(inv) : notFound();
  }),
  http.post(`${base}/invoices/:id/issue`, () => ok({ message: 'Issued' })),
  http.post(`${base}/invoices/:id/pay`, () =>
    ok({ instructions: 'Dial *165# and follow prompts to complete payment.' }, 202),
  ),
  http.get(`${base}/payments`, () => ok({ data: [] })),
  http.post(`${base}/payments`, async ({ request }) =>
    created({ id: 'pay_new', payment_no: 'PAY-001', ...((await request.json()) as object) }),
  ),
  http.get(`${base}/payments/reconciliation`, () =>
    ok({ gateway_total: 0, recorded_total: 0, difference: 0 }),
  ),
  http.post(`${base}/payment-plans`, async ({ request }) =>
    created({ id: 'pp_new', ...((await request.json()) as object) }),
  ),
  http.post(`${base}/credit-notes`, async ({ request }) =>
    created({ id: 'cn_new', cn_no: 'CN-001', ...((await request.json()) as object) }),
  ),

  // ── TCOIN documents ──────────────────────────────────────────────────────
  http.get(`${base}/receipts`, () => ok({ data: [] })),
  http.post(`${base}/receipts`, async ({ request }) =>
    created({
      id: 'rct_new',
      receipt_no: 'RCT-2025-001',
      receipt_date: new Date().toISOString().slice(0, 10),
      status: 'issued',
      verify_code: 'ABC123',
      ...((await request.json()) as object),
    }),
  ),
  http.get(`${base}/receipts/:id`, ({ params }) =>
    ok({ id: params.id, receipt_no: 'RCT-001', receipt_date: '2025-01-01', status: 'issued' }),
  ),
  http.post(`${base}/receipts/:id/void`, () => ok({ message: 'Voided' })),
  http.get(`${base}/receipts/:id/pdf`, () => ok({ url: '#' })),
  http.get(`${base}/payment-vouchers`, () => ok({ data: [] })),
  http.post(`${base}/payment-vouchers`, async ({ request }) =>
    created({
      id: 'pv_new',
      voucher_no: 'PV-2025-001',
      status: 'draft',
      ...((await request.json()) as object),
    }),
  ),
  http.get(`${base}/payment-vouchers/:id`, ({ params }) =>
    ok({ id: params.id, voucher_no: 'PV-001', status: 'draft' }),
  ),
  http.post(`${base}/payment-vouchers/:id/submit`, () => ok({ message: 'Submitted' })),
  http.post(`${base}/payment-vouchers/:id/approve`, () => ok({ message: 'Approved' })),
  http.post(`${base}/payment-vouchers/:id/pay`, () => ok({ message: 'Paid' })),
  http.post(`${base}/payment-vouchers/:id/receive`, () => ok({ message: 'Received' })),
  http.get(`${base}/payment-vouchers/:id/pdf`, () => ok({ url: '#' })),
  http.get(`${base}/delivery-notes`, () => ok({ data: [] })),
  http.post(`${base}/delivery-notes`, async ({ request }) =>
    created({ id: 'dn_new', dn_no: 'DN-2025-001', status: 'draft', ...((await request.json()) as object) }),
  ),
  http.post(`${base}/delivery-notes/:id/issue`, () => ok({ message: 'Issued' })),
  http.post(`${base}/delivery-notes/:id/deliver`, () => ok({ message: 'Delivered' })),
  http.get(`${base}/delivery-notes/:id/pdf`, () => ok({ url: '#' })),
  http.get(`${base}/letters`, () => ok({ data: [] })),
  http.post(`${base}/letters`, async ({ request }) =>
    created({ id: 'ltr_new', status: 'draft', ...((await request.json()) as object) }),
  ),
  http.post(`${base}/letters/:id/issue`, () => ok({ message: 'Issued' })),
  http.get(`${base}/letters/:id/pdf`, () => ok({ url: '#' })),

  // ── Webhooks ─────────────────────────────────────────────────────────────
  http.post(`${base}/webhooks/payments/:provider`, () => ok({ message: 'OK' })),
  http.post(`${base}/webhooks/messaging/:provider`, () => ok({ message: 'OK' })),
];
