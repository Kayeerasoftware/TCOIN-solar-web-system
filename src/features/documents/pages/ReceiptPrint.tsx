import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getReceipt } from '@/api/endpoints/documents';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { CashSalesReceipt } from '../templates/CashSalesReceipt';
import { CorporateReceipt } from '../templates/CorporateReceipt';

export default function ReceiptPrint() {
  const { id = '' } = useParams();
  const q = useQuery({ queryKey: ['receipt', id], queryFn: () => getReceipt(id) });
  useDocumentTitle(q.data ? `Receipt ${q.data.receipt_no}` : 'Receipt');
  if (q.isLoading) return <LoadingState />;
  if (q.isError || !q.data)
    return <ErrorState message="Could not load this receipt." onRetry={() => void q.refetch()} />;
  return q.data.receipt_type === 'corporate' ? (
    <CorporateReceipt receipt={q.data} />
  ) : (
    <CashSalesReceipt receipt={q.data} />
  );
}
