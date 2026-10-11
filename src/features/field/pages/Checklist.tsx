import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

const ITEMS = [
  'Site is safe to work on',
  'PPE worn by all crew',
  'Roof structure inspected and approved',
  'Mounting positions marked',
  'Cable routes planned',
  'Existing electrical system inspected',
  'Customer briefed on work scope',
];

export default function Checklist() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const allDone = ITEMS.every((_, i) => checked[i]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Pre-work checklist</h1>
      <div className="space-y-2">
        {ITEMS.map((item, i) => (
          <label
            key={i}
            className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer ${checked[i] ? 'border-brand-green bg-green-50' : 'border-line bg-white'}`}
          >
            <input
              type="checkbox"
              className="mt-0.5"
              checked={!!checked[i]}
              onChange={(e) => setChecked((c) => ({ ...c, [i]: e.target.checked }))}
            />
            <span className="text-sm">{item}</span>
          </label>
        ))}
      </div>
      <Button className="w-full" disabled={!allDone} onClick={() => navigate(`/field/jobs/${id}/parts`)}>
        {allDone ? 'Continue to parts →' : `${ITEMS.filter((_, i) => !checked[i]).length} items remaining`}
      </Button>
    </div>
  );
}
