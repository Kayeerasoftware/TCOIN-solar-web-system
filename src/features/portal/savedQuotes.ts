import type { IndicativeResult } from '@/sizing';
import type { Appliance, SystemType } from '@/sizing/types';

export type QuoteLine = {
  particulars: string;
  spec: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
};

export type SavedQuote = {
  id: string;
  ref: string;
  created_at: string;
  source: 'maker' | 'free_request';
  // contact
  name: string;
  email: string;
  phone: string;
  notes: string;
  // sizing (maker only)
  district?: string;
  system_type?: SystemType;
  appliances?: Appliance[];
  sizing?: IndicativeResult;
  lines?: QuoteLine[];
  subtotal?: number;
  vat?: number;
  total?: number;
  // free request only
  load_kw?: string;
  system_type_label?: string;
};

const KEY = 'tcoin_portal_saved_quotes';

export function loadSavedQuotes(): SavedQuote[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveQuote(q: SavedQuote): void {
  const all = loadSavedQuotes();
  localStorage.setItem(KEY, JSON.stringify([q, ...all]));
}

export function deleteQuote(id: string): void {
  const all = loadSavedQuotes().filter((q) => q.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function makeEstRef(seq: number): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `TCOIN-SLA-EST${String(seq).padStart(3, '0')}\u2013${day}${month}${year}`;
}

let _seq = loadSavedQuotes().length + 1;
export function nextRef(): string {
  return makeEstRef(_seq++);
}

let _estSeq = loadSavedQuotes().filter((q) => q.source === 'maker').length + 1;
export function nextEstRef(): string {
  return makeEstRef(_estSeq++);
}
