import { CheckCircle2 } from "lucide-react";
import type { CtaLink } from "@/types/site";
import { LinkButton } from "@/components/ui/link-button";

export function SuccessState({
  title,
  supportLine,
  description,
  highlights,
  areaStatus,
  footerNote,
  actions,
}: {
  title: string;
  supportLine?: string;
  description: string;
  highlights?: string[];
  areaStatus?: {
    heading: string;
    title: string;
    description: string;
  };
  footerNote?: string;
  actions: CtaLink[];
}) {
  return (
    <div className="surface-panel mx-auto max-w-3xl p-8 sm:p-10">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
      {supportLine ? <p className="mt-3 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">{supportLine}</p> : null}
      <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
      {highlights?.length ? (
        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-surface-1 p-5">
          <h2 className="text-lg font-semibold text-slate-950">What happens next</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-slate-600">
            {highlights.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {areaStatus ? (
        <div className="mt-6 rounded-[1.5rem] border border-sky-100 bg-sky-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">{areaStatus.heading}</p>
          <h2 className="mt-3 text-xl font-semibold text-slate-950">{areaStatus.title}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{areaStatus.description}</p>
        </div>
      ) : null}
      {footerNote ? <p className="mt-6 text-sm leading-7 text-slate-500">{footerNote}</p> : null}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {actions.map((action) => (
          <LinkButton key={action.href} href={action.href} variant={action.variant === "secondary" ? "secondary" : "primary"}>
            {action.label}
          </LinkButton>
        ))}
      </div>
    </div>
  );
}
