const tones = { green: 'bg-brand-green', amber: 'bg-amber-600', red: 'bg-brand-red', grey: 'bg-ink-muted' } as const;
export function Badge({ children, tone = 'green' }: { children: string; tone?: keyof typeof tones }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs text-white ${tones[tone]}`}>{children}</span>;
}
