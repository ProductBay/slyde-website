export function PaymentInfoCard({
  sectionId,
  title,
  body,
}: {
  sectionId: string;
  title: string;
  body: string;
}) {
  return (
    <section id={sectionId} className="surface-card p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Payment support</p>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
    </section>
  );
}
