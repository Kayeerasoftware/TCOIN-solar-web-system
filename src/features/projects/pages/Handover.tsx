import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';

export default function Handover() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handover = useMutation({
    mutationFn: () => api.post(`/projects/${id}/handover`),
    onSuccess: () => navigate(`/console/projects/${id}`),
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-green">Project handover</h1>
      <p className="mt-4 text-sm text-ink-muted">
        Triggering handover will generate the handover pack, create installed assets and warranties, and mark
        the project as completed. All mandatory checklist items must be passed and commissioning must be
        signed off first.
      </p>
      {handover.isError && (
        <p className="mt-4 rounded bg-red-50 p-3 text-sm text-brand-red">
          Handover failed. Ensure commissioning is complete and all checklist items are passed.
        </p>
      )}
      {handover.isSuccess && (
        <p className="mt-4 rounded bg-green-50 p-3 text-sm text-brand-green">
          Handover complete! Assets and warranties have been created.
        </p>
      )}
      <div className="mt-6">
        <Button onClick={() => handover.mutate()} busy={handover.isPending} disabled={handover.isSuccess}>
          Complete handover
        </Button>
      </div>
    </div>
  );
}
