import type { CurrencyCode } from './domain';

export type LeadStatus = 'new' | 'contacted' | 'survey_scheduled' | 'quoted' | 'negotiating' | 'won' | 'lost';
export const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'survey_scheduled',
  'quoted',
  'negotiating',
  'won',
  'lost',
];

export interface Page<T> {
  data: T[];
  next_cursor: string | null;
}

export interface Lead {
  id: string;
  lead_no: string;
  full_name: string;
  phone?: string;
  email?: string;
  location?: string;
  service_interest?: string;
  message?: string;
  status: LeadStatus;
  created_at: string;
}

export interface Customer {
  id: string;
  customer_no: string;
  customer_type: 'individual' | 'business' | 'institution';
  display_name: string;
  phone?: string;
  email?: string;
}

/** Catalog product as returned by GET /catalog/products. */
export interface Product {
  id: string;
  product_type: string;
  name: string;
  brand: string;
  model: string;
  slug: string;
  category: string;
  description: string;
  specs: Record<string, string>;
  warranty_months: number;
  spec_text?: string;
  images?: { url: string }[];
  variants: {
    id: string;
    sku: string;
    name: string;
    unit: string;
    price: { amount: string; currency: string };
    available_qty: number;
    image_url?: string | null;
  }[];
}

/** One sellable variant flattened for pickers (quote builder, store). */
export interface CatalogItem {
  variant_id: string;
  sku: string;
  name: string;
  specification: string;
  unit: string;
  rate: number;
  available_qty: number;
  image_url: string | null;
}

export type QuoteStatus =
  'draft' | 'pending_approval' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'superseded';

export interface QuoteLine {
  line_no: number;
  variant_id?: string | null;
  particulars: string;
  specification?: string;
  image_url?: string | null;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

/** Quote with the Proforma Invoice fields (see specification sections 17 and 20). */
export interface Quote {
  id: string;
  quote_no: string;
  proforma_no: string | null;
  customer_id: string;
  status: QuoteStatus;
  currency: CurrencyCode;
  document_title: string;
  bill_to_text: string;
  issued_on: string | null;
  validity_days: number;
  valid_until: string | null;
  show_eoe: boolean;
  show_images: boolean;
  discount_pct: number;
  subtotal: number;
  discount_amount: number;
  total: number;
  amount_in_words: string;
  signatory_name: string;
  lines: QuoteLine[];
  created_at: string;
}

export type QuoteInput = Pick<
  Quote,
  'customer_id' | 'currency' | 'document_title' | 'bill_to_text' | 'validity_days' | 'discount_pct'
> & {
  lines: Omit<QuoteLine, 'amount' | 'line_no'>[];
};

export interface ProformaResult {
  proforma_no: string;
  issued_on: string;
  valid_until: string;
  amount_in_words: string;
  total: { amount: string; currency: string };
}

export type ReceiptType = 'cash_sales' | 'corporate';
export type PaymentMethod = 'cash' | 'cheque' | 'mtn_momo' | 'airtel_money' | 'bank_transfer' | 'card';

export interface ReceiptLine {
  line_no: number;
  quantity: number;
  particulars: string;
  rate: number;
  amount: number;
}

export interface Receipt {
  id: string;
  receipt_no: string;
  receipt_type: ReceiptType;
  received_from: string;
  received_from_address?: string;
  receipt_date: string;
  amount: number;
  currency: CurrencyCode;
  amount_in_words: string;
  payment_for?: string;
  method: PaymentMethod;
  cheque_no?: string;
  balance_after: number | null;
  lines: ReceiptLine[];
  signatory_name: string;
  disclaimer?: string;
  status: 'issued' | 'void';
}

export interface ReceiptInput {
  receipt_type: ReceiptType;
  received_from: string;
  received_from_address?: string;
  amount: number;
  currency: CurrencyCode;
  method: PaymentMethod;
  cheque_no?: string;
  payment_for?: string;
  lines?: { particulars: string; quantity: number; rate: number }[];
}

export interface ReportSummary {
  pipeline_value: number;
  open_quotes: number;
  receivables: number;
  low_stock: { sku: string; name: string; available: number; reorder_level: number }[];
  leads_by_status: Record<string, number>;
}
