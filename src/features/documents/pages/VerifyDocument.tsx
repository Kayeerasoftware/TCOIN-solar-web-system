import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function VerifyDocument() {
  const { code } = useParams<{ code: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify', code],
    queryFn: () => api.get(`/documents/verify/${code}`).then((r) => r.data),
    enabled: !!code,
    retry: false,
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      {isError ? (
        <>
          <div className="text-5xl">❌</div>
          <h1 className="mt-4 text-xl font-bold text-brand-red">Document not found</h1>
          <p className="mt-2 text-sm text-ink-muted">This code is invalid or the document has been voided.</p>
        </>
      ) : (
        <>
          <div className="text-5xl">✅</div>
          <h1 className="mt-4 text-xl font-bold text-brand-green">Document verified</h1>
          <div className="mt-6 rounded-lg border border-line bg-white p-5 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-muted">Type</span>
              <span className="font-medium capitalize">{data?.doc_type?.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Number</span>
              <span className="font-medium">{data?.doc_no}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Date</span>
              <span className="font-medium">{data?.doc_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Amount</span>
              <span className="font-medium">
                {data?.currency} {data?.amount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Status</span>
              <span className="font-medium capitalize">{data?.status}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
