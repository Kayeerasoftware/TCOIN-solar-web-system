import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { issueReceipt } from '@/api/endpoints/documents';
import { AmountInWords } from '@/components/forms/AmountInWords';
import { FormField } from '@/components/forms/FormField';
import { Select, TextInput } from '@/components/forms/controls';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { applyServerErrors } from '@/lib/forms';
import { formatNumber, lineAmount, sumAmounts } from '@/lib/money';
import { receiptSchema, type ReceiptFormValues } from '../schemas';

export default function NewReceipt() {
  useDocumentTitle('New receipt');
  const navigate = useNavigate();
  const qc = useQueryClient();
  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      receipt_type: 'corporate',
      method: 'cash',
      received_from: '',
      lines: [{ particulars: '', quantity: 1, rate: 0 }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const type = watch('receipt_type');
  const method = watch('method');
  const lines = watch('lines') ?? [];
  const total =
    type === 'cash_sales'
      ? sumAmounts(lines.map((l) => lineAmount(Number(l.quantity) || 0, Number(l.rate) || 0)))
      : Number(watch('amount')) || 0;

  const linesError = errors.lines?.root?.message ?? errors.lines?.message;

  const issue = useMutation({
    mutationFn: (v: ReceiptFormValues) =>
      issueReceipt({
        receipt_type: v.receipt_type,
        received_from: v.received_from,
        received_from_address: v.received_from_address || undefined,
        currency: 'UGX',
        method: v.method,
        cheque_no: v.cheque_no || undefined,
        payment_for: v.payment_for || undefined,
        amount: v.receipt_type === 'corporate' ? Number(v.amount) : total,
        lines:
          v.receipt_type === 'cash_sales'
            ? (v.lines ?? []).filter((l) => l.particulars.trim() && l.quantity > 0)
            : undefined,
      }),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: ['receipts'] });
      navigate(`/print/receipt/${r.id}`);
    },
    onError: (e) => applyServerErrors(e, setError),
  });

  return (
    <form
      onSubmit={handleSubmit((v) => issue.mutate(v))}
      noValidate
      aria-label="New receipt"
      className="mx-auto max-w-3xl space-y-4"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green">New receipt</h1>
        <Link to="/console/documents" className="text-brand-green underline">
          Documents
        </Link>
      </div>
      {errors.root && (
        <p role="alert" className="rounded bg-red-50 p-3 text-brand-red">
          {errors.root.message}
        </p>
      )}
      <Card title="Type">
        <fieldset className="flex flex-wrap gap-6">
          <legend className="sr-only">Receipt type</legend>
          <label className="flex items-center gap-2">
            <input type="radio" value="corporate" {...register('receipt_type')} /> Corporate receipt (payment
            received)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="cash_sales" {...register('receipt_type')} /> Cash / sales receipt
            (items sold)
          </label>
        </fieldset>
      </Card>
      <Card title="Received from">
        <FormField label="Received from" htmlFor="received_from" error={errors.received_from?.message}>
          <TextInput id="received_from" invalid={!!errors.received_from} {...register('received_from')} />
        </FormField>
        <FormField label="Address (optional)" htmlFor="received_from_address">
          <TextInput id="received_from_address" {...register('received_from_address')} />
        </FormField>
      </Card>
      <Card title="Payment">
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Payment method" htmlFor="method">
            <Select id="method" {...register('method')}>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="mtn_momo">MTN MoMo</option>
              <option value="airtel_money">Airtel Money</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="card">Card</option>
            </Select>
          </FormField>
          {method === 'cheque' && (
            <FormField label="Cheque number" htmlFor="cheque_no" error={errors.cheque_no?.message}>
              <TextInput id="cheque_no" invalid={!!errors.cheque_no} {...register('cheque_no')} />
            </FormField>
          )}
        </div>
        {type === 'corporate' ? (
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Amount (UGX)" htmlFor="amount" error={errors.amount?.message}>
              <TextInput
                id="amount"
                type="number"
                min={0}
                step="any"
                invalid={!!errors.amount}
                {...register('amount')}
              />
            </FormField>
            <FormField label="Being payment of" htmlFor="payment_for">
              <TextInput
                id="payment_for"
                placeholder="For example 50% deposit on Proforma Invoice 0248"
                {...register('payment_for')}
              />
            </FormField>
          </div>
        ) : (
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th>No.</th>
                  <th>Particulars</th>
                  <th>Quantity</th>
                  <th>Rate (UGX)</th>
                  <th className="text-right">Amount (UGX)</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {fields.map((f, i) => (
                  <tr key={f.id}>
                    <td className="pr-2">{i + 1}</td>
                    <td className="pr-2">
                      <TextInput
                        aria-label={`Item ${i + 1} particulars`}
                        {...register(`lines.${i}.particulars`)}
                      />
                    </td>
                    <td className="w-24 pr-2">
                      <TextInput
                        aria-label={`Item ${i + 1} quantity`}
                        type="number"
                        step="any"
                        {...register(`lines.${i}.quantity`)}
                      />
                    </td>
                    <td className="w-36 pr-2">
                      <TextInput
                        aria-label={`Item ${i + 1} rate`}
                        type="number"
                        step="any"
                        {...register(`lines.${i}.rate`)}
                      />
                    </td>
                    <td className="text-right">
                      {formatNumber(lineAmount(Number(lines[i]?.quantity) || 0, Number(lines[i]?.rate) || 0))}
                    </td>
                    <td>
                      <Button
                        type="button"
                        variant="secondary"
                        aria-label={`Remove item ${i + 1}`}
                        onClick={() => remove(i)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {linesError && (
              <p role="alert" className="mt-1 text-sm text-brand-red">
                {linesError}
              </p>
            )}
            <div className="mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => append({ particulars: '', quantity: 1, rate: 0 })}
              >
                Add item
              </Button>
            </div>
          </div>
        )}
        <div className="mt-3 text-right text-lg font-bold">Total UGX {formatNumber(total)}</div>
        <AmountInWords amount={total} />
      </Card>
      <Button type="submit" busy={issue.isPending}>
        Issue receipt
      </Button>
    </form>
  );
}
