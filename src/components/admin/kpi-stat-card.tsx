export function KpiStatCard({
  label,
  value,
  subtext,
  note,
}: {
  label: string;
  value: number;
  subtext?: string;
  note?: string;
}) {
  return (
    <div className="surface-card p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
      {subtext ? <p className="mt-3 text-sm leading-6 text-slate-600">{subtext}</p> : null}
      {note ? <p className="mt-2 text-xs font-medium text-sky-700">{note}</p> : null}
    </div>
  );
}
