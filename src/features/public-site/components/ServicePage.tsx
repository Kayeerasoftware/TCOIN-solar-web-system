import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Card } from '@/components/ui/Card';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface Props {
  title: string;
  intro: string;
  steps: string[];
  gets: string[];
  extra?: ReactNode;
}

/** Shared layout for the four service pages. */
export function ServicePage({ title, intro, steps, gets, extra }: Props) {
  useDocumentTitle(title);
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <section className="rounded-lg border border-line bg-surface p-6">
        <h1 className="text-3xl font-extrabold text-brand-green">{title}</h1>
        <p className="mt-2 text-ink-muted">{intro}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink to="/contact">Request a quote</ButtonLink>
          <ButtonLink to="/calculator" variant="secondary">
            Try the calculator
          </ButtonLink>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="How it works">
          <ol className="space-y-2">
            {steps.map((s, i) => (
              <li key={s}>
                <b className="text-brand-accent">{i + 1}.</b> {s}
              </li>
            ))}
          </ol>
        </Card>
        <Card title="What you get">
          <ul className="list-disc space-y-1 pl-5">
            {gets.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </Card>
      </div>
      {extra}
    </div>
  );
}
