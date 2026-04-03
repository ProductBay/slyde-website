import type { ReactNode } from "react";

export function MerchantSectionCard({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
          {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        {actions}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
