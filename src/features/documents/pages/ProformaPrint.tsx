import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getQuote } from '@/api/endpoints/quotes';
import { qk } from '@/api/queryKeys';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProformaInvoice } from '../templates/ProformaInvoice';

export default function ProformaPrint() {
  const { id = '' } = useParams();
  const q = useQuery({ queryKey: qk.quote(id), queryFn: () => getQuote(id) });
  useDocumentTitle(q.data?.proforma_no ? `Proforma Invoice ${q.data.proforma_no}` : 'Proforma Invoice');
  if (q.isLoading) return <LoadingState />;
  if (q.isError || !q.data)
    return <ErrorState message="Could not load this Proforma Invoice." onRetry={() => void q.refetch()} />;
  return (
    <>
      {!q.data.proforma_no && (
        <p role="status" className="mx-auto mb-3 max-w-[210mm] rounded bg-amber-50 p-2 text-sm print:hidden">
          Preview only. This quote has not been issued yet, so it has no number.
        </p>
      )}
      <ProformaInvoice quote={q.data} />
    </>
  );
}
