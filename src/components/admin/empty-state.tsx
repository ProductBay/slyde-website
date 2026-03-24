export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="surface-card px-6 py-12 text-center">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}
