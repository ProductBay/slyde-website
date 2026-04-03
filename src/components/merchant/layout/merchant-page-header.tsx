import type { ReactNode } from "react";

export function MerchantPageHeader({
  eyebrow,
  title,
  description,
  actions,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#eef2ff_100%)] p-6 shadow-soft">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
          {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {aside ? <div className="xl:max-w-sm xl:min-w-[18rem]">{aside}</div> : null}
      </div>
    </section>
  );
}
