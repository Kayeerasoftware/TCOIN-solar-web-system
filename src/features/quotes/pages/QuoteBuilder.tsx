import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { listCatalogItems } from '@/api/endpoints/catalog';
import { listCustomers } from '@/api/endpoints/crm';
import { createQuote, getQuote, issueProforma, saveQuoteVersion } from '@/api/endpoints/quotes';
import { qk } from '@/api/queryKeys';
import { ApiError } from '@/api/errors';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { FormField } from '@/components/forms/FormField';
import { Select, TextInput } from '@/components/forms/controls';
import { LineItemEditor } from '@/components/line-items/LineItemEditor';
import { blankLine, newLineKey, type EditorLine } from '@/components/line-items/lineHelpers';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Card } from '@/components/ui/Card';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatNumber } from '@/lib/money';
import { computeTotals } from '@/lib/quoteMath';
import type { Customer, CatalogItem, Quote, QuoteInput } from '@/types/api';

function Builder({
  quote,
  customers,
  catalog,
}: {
  quote?: Quote;
  customers: Customer[];
  catalog: CatalogItem[];
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const locked = !!quote?.proforma_no;
  const [customerId, setCustomerId] = useState(quote?.customer_id ?? '');
  const [title, setTitle] = useState(quote?.document_title ?? 'Quotation');
  const [billTo, setBillTo] = useState(quote?.bill_to_text ?? '');
  const [validity, setValidity] = useState(quote?.validity_days ?? 30);
  const [discount, setDiscount] = useState(quote?.discount_pct ?? 0);
  const [lines, setLines] = useState<EditorLine[]>(
    quote
      ? quote.lines.map((l) => ({
          key: newLineKey(),
          variant_id: l.variant_id,
          particulars: l.particulars,
          specification: l.specification ?? '',
          unit: l.unit,
          quantity: l.quantity,
          rate: l.rate,
          image_url: l.image_url,
        }))
      : [blankLine()],
  );
  const [problem, setProblem] = useState('');

  const usable = lines.filter((l) => l.particulars.trim() && l.quantity > 0);
  const totals = computeTotals(usable, discount);

  const pickCustomer = (id: string) => {
    const prev = customers.find((c) => c.id === customerId)?.display_name;
    setCustomerId(id);
    if (!billTo || billTo === prev) setBillTo(customers.find((c) => c.id === id)?.display_name ?? '');
  };

  const validate = (): string => {
    if (!customerId) return 'Choose a customer.';
    if (!usable.length) return 'Add at least one line with particulars and a quantity.';
    return '';
  };
  const toInput = (): QuoteInput => ({
    customer_id: customerId,
    currency: 'UGX',
    document_title: title,
    bill_to_text: billTo,
    validity_days: validity,
    discount_pct: discount,
    lines: usable.map((l) => ({
      variant_id: l.variant_id ?? null,
      particulars: l.particulars,
      specification: l.specification,
      unit: l.unit,
      quantity: l.quantity,
      rate: l.rate,
      image_url: l.image_url,
    })),
  });

  const save = useMutation({
    mutationFn: async (): Promise<Quote> => {
      const m = validate();
      if (m) throw new Error(m);
      return quote ? saveQuoteVersion(quote.id, toInput()) : createQuote(toInput());
    },
    onSuccess: (q) => {
      void qc.invalidateQueries({ queryKey: qk.quotes() });
      setProblem('');
      if (!quote) navigate(`/console/quotes/${q.id}`, { replace: true });
    },
    onError: (e: Error) => setProblem(e.message),
  });
  const issue = useMutation({
    mutationFn: async () => {
      const saved = await save.mutateAsync();
      await issueProforma(saved.id);
      return saved.id;
    },
    onSuccess: (id) => {
      void qc.invalidateQueries({ queryKey: qk.quotes() });
      navigate(`/print/proforma/${id}`);
    },
    onError: (e: Error) => setProblem(e instanceof ApiError ? e.message : e.message),
  });
  const busy = save.isPending || issue.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-brand-green">
          {quote
            ? `${quote.proforma_no ? `Proforma Invoice ${quote.proforma_no}` : quote.quote_no}`
            : 'New quote'}
        </h1>
        <Link to="/console/quotes" className="text-brand-green underline">
          All quotes
        </Link>
      </div>
      {locked && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-green bg-green-50 p-3"
        >
          <span>
            This quote was issued as Proforma Invoice {quote!.proforma_no} and can no longer be edited. Create
            a new quote to change prices.
          </span>
          <ButtonLink to={`/print/proforma/${quote!.id}`}>Open print view</ButtonLink>
        </div>
      )}
      {problem && (
        <p role="alert" className="rounded bg-red-50 p-3 text-brand-red">
          {problem}
        </p>
      )}
      <fieldset disabled={locked || busy} className="space-y-4">
        <Card title="Customer and document">
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Customer" htmlFor="customer">
              <Select id="customer" value={customerId} onChange={(e) => pickCustomer(e.target.value)}>
                <option value="">Choose a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.display_name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="To M/s (printed on the invoice)" htmlFor="billto">
              <TextInput id="billto" value={billTo} onChange={(e) => setBillTo(e.target.value)} />
            </FormField>
            <FormField label="Document title" htmlFor="title">
              <TextInput id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormField>
            <FormField label="Valid for (days)" htmlFor="validity">
              <TextInput
                id="validity"
                type="number"
                min={1}
                value={validity}
                onChange={(e) => setValidity(Number(e.target.value))}
              />
            </FormField>
          </div>
        </Card>
        <Card title="Lines">
          <LineItemEditor lines={lines} onChange={setLines} catalog={catalog} disabled={locked || busy} />
        </Card>
        <Card title="Totals">
          <div className="grid gap-3 md:grid-cols-3">
            <FormField label="Discount (%)" htmlFor="discount">
              <TextInput
                id="discount"
                type="number"
                min={0}
                max={100}
                step="any"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </FormField>
            <dl className="md:col-span-2">
              <div className="flex justify-between border-b border-line py-1">
                <dt>Subtotal</dt>
                <dd>UGX {formatNumber(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between border-b border-line py-1">
                <dt>Discount</dt>
                <dd>- UGX {formatNumber(totals.discount_amount)}</dd>
              </div>
              <div className="flex justify-between py-1 text-lg font-bold">
                <dt>Grand total</dt>
                <dd>UGX {formatNumber(totals.total)}</dd>
              </div>
            </dl>
          </div>
          {totals.amount_in_words && <p className="mt-2 italic text-ink-muted">{totals.amount_in_words}</p>}
        </Card>
      </fieldset>
      {!locked && (
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" busy={busy} onClick={() => save.mutate()}>
            Save draft
          </Button>
          <Button busy={busy} onClick={() => issue.mutate()}>
            Issue Proforma Invoice
          </Button>
        </div>
      )}
    </div>
  );
}

export default function QuoteBuilder() {
  const { id = 'new' } = useParams();
  const isNew = id === 'new';
  useDocumentTitle(isNew ? 'New quote' : 'Quote');
  const customers = useQuery({ queryKey: ['customers'], queryFn: listCustomers });
  const catalog = useQuery({ queryKey: qk.products(), queryFn: listCatalogItems });
  const quote = useQuery({ queryKey: qk.quote(id), queryFn: () => getQuote(id), enabled: !isNew });
  if (customers.isLoading || catalog.isLoading || (!isNew && quote.isLoading)) return <LoadingState />;
  if (customers.isError || catalog.isError || (!isNew && quote.isError))
    return (
      <ErrorState
        message="Could not load this quote."
        onRetry={() => {
          void customers.refetch();
          void catalog.refetch();
          void quote.refetch();
        }}
      />
    );
  return (
    <Builder
      key={quote.data?.id ?? 'new'}
      quote={isNew ? undefined : quote.data}
      customers={customers.data ?? []}
      catalog={catalog.data ?? []}
    />
  );
}
