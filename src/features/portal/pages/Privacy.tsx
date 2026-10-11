import { useCompanyProfile } from '@/hooks/useCompanyProfile';

export default function Privacy() {
  const p = useCompanyProfile();
  return (
    <div className="max-w-2xl text-sm text-ink-muted">
      <h1 className="text-2xl font-bold text-ink">Privacy &amp; data</h1>
      <p className="mt-4">
        We collect only the information necessary to provide our services. Your data is stored securely and
        never sold to third parties.
      </p>
      <h2 className="mt-6 font-bold text-ink">Data we hold</h2>
      <ul className="mt-2 space-y-1 list-disc list-inside">
        <li>Contact details (name, email, phone)</li>
        <li>Site and installation information</li>
        <li>Billing and payment records (required by law for 7 years)</li>
        <li>Support ticket history</li>
      </ul>
      <h2 className="mt-6 font-bold text-ink">Your rights</h2>
      <p className="mt-2">
        You may request a copy of your data or ask us to delete your personal information (subject to legal
        hold requirements) by contacting us at{' '}
        <a href={`mailto:${p.email}`} className="text-brand-green underline">
          {p.email}
        </a>
        .
      </p>
    </div>
  );
}
