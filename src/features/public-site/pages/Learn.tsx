const posts = [
  {
    title: 'How to choose the right solar inverter',
    date: '2024-11-01',
    excerpt: 'String, hybrid, or off-grid? We break down the options for Ugandan conditions.',
  },
  {
    title: 'Understanding peak sun hours in Uganda',
    date: '2024-10-15',
    excerpt: "Uganda averages 5\u20136 peak sun hours per day. Here's what that means for your system size.",
  },
  {
    title: 'LiFePO4 vs lead-acid batteries',
    date: '2024-09-20',
    excerpt: 'Lithium iron phosphate batteries cost more upfront but last 3–4× longer. We do the maths.',
  },
  {
    title: 'How to read your electricity bill',
    date: '2024-08-10',
    excerpt: 'Understanding UMEME tariffs and how solar can cut your bill by up to 80%.',
  },
];

export default function Learn() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-green">Learn</h1>
      <p className="mt-2 text-ink-muted">Solar guides, tips, and news from the TCOIN SOLAR UG team.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {posts.map((p) => (
          <article key={p.title} className="rounded-lg border border-line bg-white p-5">
            <p className="text-xs text-ink-muted">{p.date}</p>
            <h2 className="mt-1 font-bold text-brand-green">{p.title}</h2>
            <p className="mt-2 text-sm text-ink-muted">{p.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
