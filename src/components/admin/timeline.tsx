export function Timeline({
  items,
}: {
  items: Array<{ id: string; title: string; meta?: string; body?: string }>;
}) {
  return (
    <div className="surface-panel min-w-0 p-6">
      <div className="space-y-5">
        {items.map((item, index) => (
          <div key={item.id} className="relative min-w-0 pl-8">
            {index < items.length - 1 ? <span className="absolute left-[9px] top-7 h-[calc(100%+1.25rem)] w-px bg-slate-200" /> : null}
            <span className="absolute left-0 top-1.5 h-5 w-5 rounded-full border border-sky-200 bg-sky-50" />
            <p className="text-sm font-semibold text-slate-950">{item.title}</p>
            {item.meta ? <p className="mt-1 break-words text-xs uppercase tracking-[0.18em] text-slate-500">{item.meta}</p> : null}
            {item.body ? <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-3 text-sm leading-7 text-slate-600">{item.body}</pre> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
