export function TrustPillarsRow({
  sectionId,
  items,
}: {
  sectionId: string;
  items: Array<{ id: string; label: string }>;
}) {
  return (
    <section id={sectionId} className="section-shell py-6">
      <div className="surface-card p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-[1.35rem] border border-slate-200 bg-slate-50/80 px-4 py-4 text-[11px] font-semibold uppercase leading-relaxed tracking-[0.16em] text-slate-700 sm:text-sm sm:tracking-[0.18em]"
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
