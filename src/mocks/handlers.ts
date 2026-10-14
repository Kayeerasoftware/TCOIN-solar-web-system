import { http, HttpResponse } from 'msw';
import { FALLBACK_PROFILE } from '@/config/companyProfile';
import { env } from '@/lib/env';
import { amountInWords } from '@/lib/amountInWords';
import { computeTotals, withAmounts } from '@/lib/quoteMath';
import { sumAmounts } from '@/lib/money';
import type { Lead, Quote, QuoteInput, Receipt, ReceiptInput, ReportSummary } from '@/types/api';
import { db, nextNumber, type MockUser } from './db';

const base = env.VITE_API_URL;
const problem = (
  status: number,
  code: string,
  title: string,
  errors?: { field: string; message: string }[],
) =>
  HttpResponse.json(
    { type: 'about:blank', title, status, code, errors },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
const publicUser = (u: MockUser) => ({
  id: u.id,
  full_name: u.full_name,
  avatar: (u as MockUser & { avatar?: string | null }).avatar ?? null,
  user_type: u.user_type,
  customer_id: u.customer_id,
  roles: u.roles,
  permissions: u.permissions,
});
const tokensFor = (u: MockUser) => ({
  access_token: `mock-access-${u.id}`,
  refresh_token: `mock-refresh-${u.id}`,
  expires_in: 900,
});
const userOf = (req: Request): MockUser | undefined => {
  const m = /^Bearer mock-access-(.+)$/.exec(req.headers.get('authorization') ?? '');
  return m ? db.users.find((u) => u.id === m[1]) : undefined;
};
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, d: number) =>
  new Date(new Date(iso).getTime() + d * 86400000).toISOString().slice(0, 10);
const REORDER: Record<string, number> = {
  'PV-550': 40,
  'INV-8K': 3,
  'BAT-5K': 6,
  'CBL-6': 100,
  'MNT-01': 15,
  'MPPT-60': 5,
};

const portalQuote = (q: Quote) => ({
  ...q,
  version: {
    lines: q.lines,
    subtotal: { amount: String(q.subtotal), currency: q.currency },
    discount_amount: { amount: String(q.discount_amount), currency: q.currency },
    tax_amount: { amount: '0', currency: q.currency },
    total: { amount: String(q.total), currency: q.currency },
  },
});

/** Tracks the logged-in user for /me during a mock session — resolved per-request via userOf(). */

export const handlers = [
  // ---- auth
  http.post(`${base}/auth/login`, async ({ request }) => {
    const { identifier, password } = (await request.json()) as { identifier: string; password: string };
    const id = String(identifier ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s/g, '');
    const u = db.users.find(
      (x) => (x.email === id || x.phone.replace('+', '') === id.replace('+', '')) && x.password === password,
    );
    if (!u) return problem(401, 'unauthorized', 'Wrong email, phone, or password');
    if (u.mfa) return HttpResponse.json({ mfa_required: true, mfa_token: `mfa-${u.id}` });
    return HttpResponse.json(tokensFor(u));
  }),
  http.post(`${base}/auth/mfa/verify`, async ({ request }) => {
    const { mfa_token, code } = (await request.json()) as { mfa_token: string; code: string };
    const u = db.users.find((x) => `mfa-${x.id}` === mfa_token);
    return u && code === '123456'
      ? HttpResponse.json(tokensFor(u))
      : problem(401, 'unauthorized', 'That code is not correct');
  }),
  http.post(`${base}/auth/otp/request`, () => new HttpResponse(null, { status: 202 })),
  http.post(`${base}/auth/otp/verify`, async ({ request }) => {
    const { phone, code } = (await request.json()) as { phone: string; code: string };
    const u = db.users.find(
      (x) => x.user_type === 'customer' && x.phone.replace('+', '') === phone.replace(/[\s+]/g, ''),
    );
    return u && code === '123456'
      ? HttpResponse.json(tokensFor(u))
      : problem(401, 'unauthorized', 'That code is not correct');
  }),
  http.post(`${base}/auth/refresh`, async ({ request }) => {
    const { refresh_token } = (await request.json()) as { refresh_token: string };
    const u = db.users.find((x) => `mock-refresh-${x.id}` === refresh_token);
    return u ? HttpResponse.json(tokensFor(u)) : problem(401, 'unauthorized', 'Session expired');
  }),
  http.get(`${base}/me`, ({ request }) => {
    const u = userOf(request);
    return u ? HttpResponse.json(publicUser(u)) : problem(401, 'unauthorized', 'Sign in required');
  }),
  http.post(`${base}/auth/logout`, () => new HttpResponse(null, { status: 204 })),
  // ---- public
  http.get(`${base}/company-profile`, () => HttpResponse.json(FALLBACK_PROFILE)),
  http.get(`${base}/amount-in-words`, ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json({
      words: amountInWords(
        Number(url.searchParams.get('amount')),
        (url.searchParams.get('currency') ?? 'UGX') as 'UGX',
      ),
    });
  }),
  http.post(`${base}/public/leads`, async ({ request }) => {
    const b = (await request.json()) as Partial<Lead> & Record<string, unknown>;
    const errors: { field: string; message: string }[] = [];
    if (!b.full_name) errors.push({ field: 'full_name', message: 'Name is required' });
    if (!b.phone && !b.email)
      errors.push({ field: 'phone', message: 'Give a phone number or an email address' });
    if (errors.length) return problem(422, 'validation_failed', 'Validation failed', errors);
    const lead: Lead = {
      id: `l-${Date.now()}`,
      lead_no: `LD-2026-${nextNumber('lead', 6)}`,
      full_name: b.full_name!,
      phone: b.phone,
      email: b.email,
      location: b.location,
      service_interest: b.service_interest,
      message: b.message,
      status: 'new',
      created_at: new Date().toISOString(),
    };
    db.leads.unshift(lead);
    return HttpResponse.json({ lead_no: lead.lead_no }, { status: 201 });
  }),
  // ---- staff
  http.get(`${base}/leads`, ({ request }) => {
    if (!userOf(request)) return problem(401, 'unauthorized', 'Sign in required');
    const status = new URL(request.url).searchParams.get('status');
    return HttpResponse.json({
      data: db.leads.filter((l) => !status || l.status === status),
      next_cursor: null,
    });
  }),
  http.patch(`${base}/leads/:id`, async ({ request, params }) => {
    if (!userOf(request)) return problem(401, 'unauthorized', 'Sign in required');
    const lead = db.leads.find((l) => l.id === params.id);
    if (!lead) return problem(404, 'not_found', 'Lead not found');
    Object.assign(lead, await request.json());
    return HttpResponse.json(lead);
  }),
  http.get(`${base}/customers`, ({ request }) =>
    userOf(request)
      ? HttpResponse.json({ data: db.customers, next_cursor: null })
      : problem(401, 'unauthorized', 'Sign in required'),
  ),
  http.get(`${base}/catalog/products`, ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const q = url.searchParams.get('q')?.toLowerCase();
    let products = db.products;
    if (category) products = products.filter((p) => p.category === category);
    if (q)
      products = products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q),
      );
    return HttpResponse.json({ data: products, next_cursor: null });
  }),
  http.get(`${base}/catalog/products/:slug`, ({ params }) => {
    const p = db.products.find(
      (x) => x.id === params.slug || x.slug === params.slug || x.variants.some((v) => v.sku === params.slug),
    );
    return p ? HttpResponse.json(p) : HttpResponse.json({ title: 'Not found', status: 404 }, { status: 404 });
  }),
  http.get(`${base}/quotes`, ({ request }) => {
    if (!userOf(request)) return problem(401, 'unauthorized', 'Sign in required');
    const u = userOf(request)!;
    const status = new URL(request.url).searchParams.get('status');
    let data =
      u.user_type === 'customer' ? db.quotes.filter((q) => q.customer_id === u.customer_id) : db.quotes;
    if (status) data = data.filter((q) => q.status === status);
    const out = u.user_type === 'customer' ? data.map(portalQuote) : data;
    return HttpResponse.json({ data: out, next_cursor: null });
  }),
  http.get(`${base}/quotes/:id`, ({ request, params }) => {
    if (!userOf(request)) return problem(401, 'unauthorized', 'Sign in required');
    const u = userOf(request)!;
    const q = db.quotes.find((x) => x.id === params.id);
    if (!q) return problem(404, 'not_found', 'Quote not found');
    return HttpResponse.json(u.user_type === 'customer' ? portalQuote(q) : q);
  }),
  http.post(`${base}/quotes/:id/accept`, ({ request, params }) => {
    if (!userOf(request)) return problem(401, 'unauthorized', 'Sign in required');
    const q = db.quotes.find((x) => x.id === params.id);
    if (!q) return problem(404, 'not_found', 'Quote not found');
    q.status = 'accepted';
    return HttpResponse.json({ status: 'accepted' });
  }),
  http.post(`${base}/quotes`, async ({ request }) => {
    const u = userOf(request);
    if (!u) return problem(401, 'unauthorized', 'Sign in required');
    const b = (await request.json()) as QuoteInput;
    if (!b.customer_id)
      return problem(422, 'validation_failed', 'Validation failed', [
        { field: 'customer_id', message: 'Choose a customer' },
      ]);
    if (!b.lines?.length)
      return problem(422, 'validation_failed', 'Validation failed', [
        { field: 'lines', message: 'Add at least one line' },
      ]);
    const lines = withAmounts(b.lines);
    const t = computeTotals(lines, b.discount_pct, b.currency);
    const q: Quote = {
      id: `q-${Date.now()}`,
      quote_no: `QT-2026-${nextNumber('quote', 6)}`,
      proforma_no: null,
      customer_id: b.customer_id,
      status: 'draft',
      currency: b.currency,
      document_title: b.document_title,
      bill_to_text: b.bill_to_text,
      issued_on: null,
      validity_days: b.validity_days,
      valid_until: null,
      show_eoe: true,
      show_images: true,
      discount_pct: b.discount_pct,
      ...t,
      signatory_name: u.full_name.toUpperCase(),
      lines,
      created_at: new Date().toISOString(),
    };
    db.quotes.unshift(q);
    return HttpResponse.json(q, { status: 201 });
  }),
  http.post(`${base}/quotes/:id/versions`, async ({ request, params }) => {
    if (!userOf(request)) return problem(401, 'unauthorized', 'Sign in required');
    const q = db.quotes.find((x) => x.id === params.id);
    if (!q) return problem(404, 'not_found', 'Quote not found');
    if (q.proforma_no)
      return problem(
        409,
        'invalid_transition',
        'This quote was issued as a Proforma Invoice and can no longer be edited',
      );
    const b = (await request.json()) as QuoteInput;
    const lines = withAmounts(b.lines);
    Object.assign(q, {
      document_title: b.document_title,
      bill_to_text: b.bill_to_text,
      validity_days: b.validity_days,
      discount_pct: b.discount_pct,
      customer_id: b.customer_id,
      lines,
      ...computeTotals(lines, b.discount_pct, q.currency),
    });
    return HttpResponse.json(q, { status: 201 });
  }),
  http.post(`${base}/quotes/:id/proforma`, ({ request, params }) => {
    if (!userOf(request)) return problem(401, 'unauthorized', 'Sign in required');
    const q = db.quotes.find((x) => x.id === params.id);
    if (!q) return problem(404, 'not_found', 'Quote not found');
    if (q.proforma_no)
      return problem(409, 'already_processed', 'A Proforma Invoice was already issued for this quote');
    if (!q.lines.length)
      return problem(422, 'validation_failed', 'Validation failed', [
        { field: 'lines', message: 'Add at least one line' },
      ]);
    q.proforma_no = nextNumber('proforma');
    q.status = 'sent';
    q.issued_on = today();
    q.valid_until = addDays(q.issued_on, q.validity_days);
    return HttpResponse.json(
      {
        proforma_no: q.proforma_no,
        issued_on: q.issued_on,
        valid_until: q.valid_until,
        amount_in_words: q.amount_in_words,
        total: { amount: q.total.toFixed(2), currency: q.currency },
      },
      { status: 201 },
    );
  }),
  http.get(`${base}/receipts`, ({ request }) =>
    userOf(request)
      ? HttpResponse.json({ data: db.receipts, next_cursor: null })
      : problem(401, 'unauthorized', 'Sign in required'),
  ),
  http.get(`${base}/receipts/:id`, ({ request, params }) => {
    if (!userOf(request)) return problem(401, 'unauthorized', 'Sign in required');
    const r = db.receipts.find((x) => x.id === params.id);
    return r ? HttpResponse.json(r) : problem(404, 'not_found', 'Receipt not found');
  }),
  http.post(`${base}/receipts`, async ({ request }) => {
    const u = userOf(request);
    if (!u) return problem(401, 'unauthorized', 'Sign in required');
    if (!u.permissions.includes('receipts.issue'))
      return problem(403, 'forbidden', 'You cannot issue receipts');
    const b = (await request.json()) as ReceiptInput;
    const errors: { field: string; message: string }[] = [];
    if (!b.received_from)
      errors.push({ field: 'received_from', message: 'Enter who the money was received from' });
    if (b.method === 'cheque' && !b.cheque_no)
      errors.push({ field: 'cheque_no', message: 'Enter the cheque number' });
    if (b.receipt_type === 'cash_sales' && !b.lines?.length)
      errors.push({ field: 'lines', message: 'Add at least one item' });
    const lines = withAmounts((b.lines ?? []).map((l) => ({ ...l, unit: 'pc' }))).map(
      ({ line_no, quantity, particulars, rate, amount }) => ({
        line_no,
        quantity,
        particulars,
        rate,
        amount,
      }),
    );
    const amount =
      b.receipt_type === 'cash_sales' ? sumAmounts(lines.map((l) => l.amount)) : Number(b.amount);
    if (!(amount > 0)) errors.push({ field: 'amount', message: 'Enter an amount greater than zero' });
    if (errors.length) return problem(422, 'validation_failed', 'Validation failed', errors);
    const r: Receipt = {
      id: `r-${Date.now()}`,
      receipt_no: nextNumber(b.receipt_type),
      receipt_type: b.receipt_type,
      received_from: b.received_from,
      received_from_address: b.received_from_address,
      receipt_date: today(),
      amount,
      currency: b.currency,
      amount_in_words: amountInWords(amount, b.currency),
      payment_for: b.payment_for,
      method: b.method,
      cheque_no: b.cheque_no,
      balance_after: null,
      lines,
      signatory_name: u.full_name.toUpperCase(),
      disclaimer: b.receipt_type === 'cash_sales' ? 'Goods once sold are not returned' : undefined,
      status: 'issued',
    };
    db.receipts.unshift(r);
    return HttpResponse.json(r, { status: 201 });
  }),
  // ---- orders
  http.get(`${base}/orders`, ({ request }) => {
    const u = userOf(request);
    if (!u) return problem(401, 'unauthorized', 'Sign in required');
    const data =
      u.user_type === 'customer' ? db.orders.filter((o) => o.customer_id === u.customer_id) : db.orders;
    return HttpResponse.json({ data, next_cursor: null });
  }),
  http.get(`${base}/orders/:id`, ({ request, params }) => {
    if (!userOf(request)) return problem(401, 'unauthorized', 'Sign in required');
    const o = db.orders.find((x) => x.id === params.id);
    return o ? HttpResponse.json(o) : problem(404, 'not_found', 'Order not found');
  }),
  http.post(`${base}/orders`, async ({ request }) => {
    const u = userOf(request);
    if (!u) return problem(401, 'unauthorized', 'Sign in required');
    const b = (await request.json()) as {
      items: { variant_id: string; quantity: number }[];
      deliver_to: object;
      contact: object;
      payment_method: string;
      notes?: string;
    };
    if (!b.items?.length)
      return problem(422, 'validation_failed', 'Validation failed', [
        { field: 'items', message: 'Cart is empty' },
      ]);
    const amount = b.items.reduce((s, item) => {
      const variant = db.products.flatMap((p) => p.variants).find((v) => v.id === item.variant_id);
      return s + (variant ? Number(variant.price.amount) * item.quantity : 0);
    }, 0);
    const o = {
      id: `ord-${Date.now()}`,
      order_no: `ORD-2025-${String(db.orders.length + 1).padStart(4, '0')}`,
      status: 'pending',
      placed_at: new Date().toISOString(),
      total: { amount: String(amount), currency: 'UGX' },
      customer_id: u.customer_id,
      payment_method: b.payment_method,
      deliver_to: b.deliver_to,
    };
    db.orders.unshift(o);
    return HttpResponse.json(o, { status: 201 });
  }),
  // ---- portal: projects
  http.get(`${base}/projects`, ({ request }) => {
    const u = userOf(request);
    if (!u) return problem(401, 'unauthorized', 'Sign in required');
    const data =
      u.user_type === 'customer' ? db.projects.filter((p) => p.customer_id === u.customer_id) : db.projects;
    return HttpResponse.json({ data, next_cursor: null });
  }),
  http.get(`${base}/projects/:id`, ({ request, params }) => {
    const u = userOf(request);
    if (!u) return problem(401, 'unauthorized', 'Sign in required');
    const p = db.projects.find((x) => x.id === params.id);
    if (!p) return problem(404, 'not_found', 'Project not found');
    return HttpResponse.json(p);
  }),
  http.get(`${base}/projects/:id/milestones`, ({ request, params }) => {
    if (!userOf(request)) return problem(401, 'unauthorized', 'Sign in required');
    return HttpResponse.json({ data: db.milestones[params.id as string] ?? [], next_cursor: null });
  }),
  // ---- portal: invoices
  http.get(`${base}/invoices`, ({ request }) => {
    const u = userOf(request);
    if (!u) return problem(401, 'unauthorized', 'Sign in required');
    const data =
      u.user_type === 'customer' ? db.invoices.filter((i) => i.customer_id === u.customer_id) : db.invoices;
    return HttpResponse.json({ data, next_cursor: null });
  }),
  http.post(`${base}/invoices/:id/pay`, ({ request, params }) => {
    if (!userOf(request)) return problem(401, 'unauthorized', 'Sign in required');
    const inv = db.invoices.find((i) => i.id === params.id);
    if (!inv) return problem(404, 'not_found', 'Invoice not found');
    return HttpResponse.json(
      { instructions: 'Dial *165# and follow the prompts to complete payment.' },
      { status: 200 },
    );
  }),
  // ---- portal: assets & warranties
  http.get(`${base}/assets`, ({ request }) => {
    const u = userOf(request);
    if (!u) return problem(401, 'unauthorized', 'Sign in required');
    const data =
      u.user_type === 'customer' ? db.assets.filter((a) => a.customer_id === u.customer_id) : db.assets;
    return HttpResponse.json({ data, next_cursor: null });
  }),
  http.get(`${base}/assets/:id/warranties`, ({ request, params }) => {
    if (!userOf(request)) return problem(401, 'unauthorized', 'Sign in required');
    return HttpResponse.json({ data: db.warranties[params.id as string] ?? [], next_cursor: null });
  }),
  // ---- portal: tickets
  http.get(`${base}/tickets`, ({ request }) => {
    const u = userOf(request);
    if (!u) return problem(401, 'unauthorized', 'Sign in required');
    const data =
      u.user_type === 'customer' ? db.tickets.filter((t) => t.customer_id === u.customer_id) : db.tickets;
    return HttpResponse.json({ data, next_cursor: null });
  }),
  http.get(`${base}/tickets/:id`, ({ request, params }) => {
    if (!userOf(request)) return problem(401, 'unauthorized', 'Sign in required');
    const t = db.tickets.find((x) => x.id === params.id);
    return t ? HttpResponse.json(t) : problem(404, 'not_found', 'Ticket not found');
  }),
  http.post(`${base}/tickets`, async ({ request }) => {
    const u = userOf(request);
    if (!u) return problem(401, 'unauthorized', 'Sign in required');
    const b = (await request.json()) as {
      subject: string;
      category: string;
      priority: string;
      description?: string;
    };
    if (!b.subject)
      return problem(422, 'validation_failed', 'Validation failed', [
        { field: 'subject', message: 'Subject is required' },
      ]);
    const t = {
      id: `tkt-${Date.now()}`,
      ticket_no: `TKT-2025-${String(db.tickets.length + 1).padStart(4, '0')}`,
      subject: b.subject,
      category: b.category,
      priority: b.priority,
      status: 'open',
      description: b.description ?? '',
      customer_id: u.customer_id,
      sla_response_due: new Date(Date.now() + 4 * 3600_000).toISOString(),
      sla_resolution_due: new Date(Date.now() + 48 * 3600_000).toISOString(),
    };
    db.tickets.unshift(t);
    return HttpResponse.json(t, { status: 201 });
  }),
  http.post(`${base}/tickets/:id/replies`, ({ request, params }) => {
    if (!userOf(request)) return problem(401, 'unauthorized', 'Sign in required');
    const t = db.tickets.find((x) => x.id === params.id);
    if (!t) return problem(404, 'not_found', 'Ticket not found');
    return HttpResponse.json({ id: `reply-${Date.now()}` }, { status: 201 });
  }),
  // ---- reports
  http.get(`${base}/reports/summary`, ({ request }) => {
    if (!userOf(request)) return problem(401, 'unauthorized', 'Sign in required');
    const open = db.quotes.filter((q) => ['draft', 'sent', 'pending_approval'].includes(q.status));
    const leads_by_status: Record<string, number> = {};
    db.leads.forEach((l) => {
      leads_by_status[l.status] = (leads_by_status[l.status] ?? 0) + 1;
    });
    const low_stock = db.products
      .flatMap((p) => p.variants)
      .filter((v) => v.available_qty <= (REORDER[v.sku] ?? 0))
      .map((v) => ({ sku: v.sku, name: v.name, available: v.available_qty, reorder_level: REORDER[v.sku] }));
    const summary: ReportSummary = {
      pipeline_value: sumAmounts(open.map((q) => q.total)),
      open_quotes: open.length,
      receivables: Math.max(
        0,
        sumAmounts(db.quotes.filter((q) => q.status === 'accepted').map((q) => q.total)) -
          sumAmounts(db.receipts.filter((r) => r.receipt_type === 'corporate').map((r) => r.amount)),
      ),
      low_stock,
      leads_by_status,
    };
    return HttpResponse.json(summary);
  }),
];
