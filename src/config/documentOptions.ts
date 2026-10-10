/** Defaults for printed documents. The API (documents.options setting) overrides these. */
export const DOCUMENT_DEFAULTS = {
  proformaValidityDays: 30,
  showEoe: true,
  footer: 'We Plan and Do . . . .',
  receiptDisclaimer: 'Goods once sold are not returned',
  taxMode: 'none' as 'none' | 'vat' | 'efris',
};
export const LINE_ITEM_HEADERS = ['No.', 'Particulars', 'Size / Specification', 'Image', 'Quantity', 'Unit', 'Rate (UGX)', 'Amount (UGX)'] as const;
