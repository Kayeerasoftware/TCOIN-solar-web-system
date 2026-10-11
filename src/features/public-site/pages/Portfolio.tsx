const projects = [
  { name: 'Kampala Residential 5 kWp', type: 'Hybrid', location: 'Nabulagala, Kampala', year: 2024 },
  { name: 'Mukono School 10 kWp', type: 'Off-grid', location: 'Mukono', year: 2024 },
  { name: 'Entebbe Hotel 20 kWp', type: 'On-grid', location: 'Entebbe', year: 2023 },
  { name: 'Jinja Factory 50 kWp', type: 'On-grid', location: 'Jinja', year: 2023 },
  { name: 'Masaka Clinic 8 kWp', type: 'Hybrid', location: 'Masaka', year: 2023 },
  { name: 'Gulu Community Centre 15 kWp', type: 'Off-grid', location: 'Gulu', year: 2022 },
];

export default function Portfolio() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-green">Our projects</h1>
      <p className="mt-2 text-ink-muted">A selection of completed solar installations across Uganda.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <div key={p.name} className="rounded-lg border border-line bg-white p-5">
            <div className="inline-block rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-brand-green">
              {p.type}
            </div>
            <h2 className="mt-2 font-bold">{p.name}</h2>
            <p className="mt-1 text-sm text-ink-muted">
              📍 {p.location} · {p.year}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
