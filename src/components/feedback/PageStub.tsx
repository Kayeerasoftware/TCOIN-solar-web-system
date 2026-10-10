interface Props { title: string; feature?: string; description?: string }

/** Placeholder rendered by every page until its screen is built. Replace per page. */
export function PageStub({ title, feature, description }: Props) {
  return (
    <section className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold text-brand-green">{title}</h1>
      {feature && <p className="mt-1 text-sm text-ink-muted">Feature: {feature}</p>}
      <p className="mt-4 text-ink-muted">{description ?? 'This screen is not built yet. See docs/screen-map.md for the design to implement.'}</p>
    </section>
  );
}
