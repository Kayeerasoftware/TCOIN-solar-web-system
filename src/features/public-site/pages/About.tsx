import { Card } from '@/components/ui/Card';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function About() {
  useDocumentTitle('About');
  const p = useCompanyProfile();
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <h1 className="text-3xl font-extrabold text-brand-green">About {p.division_short}</h1>
      <p className="text-ink-muted">
        {p.division} is the solar division of {p.company}, {p.legal_name}. {p.tagline}.
      </p>
      <Card title="What TCOIN does">
        <ul className="list-disc space-y-1 pl-5">
          {p.what_we_do.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </Card>
      <Card title="Find us">
        <p>
          {p.address}, {p.po_box}
        </p>
        <p className="text-sm text-ink-muted">
          {p.web} | {p.email}
        </p>
      </Card>
    </div>
  );
}
