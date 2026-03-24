import type { LucideIcon } from "lucide-react";
import type { InfoCard } from "@/types/site";

export function InfoCardGrid({
  items,
  columns = "three",
}: {
  items: Array<InfoCard & { icon?: LucideIcon }>;
  columns?: "two" | "three" | "four";
}) {
  const gridClass =
    columns === "two"
      ? "md:grid-cols-2"
      : columns === "four"
        ? "md:grid-cols-2 xl:grid-cols-4"
        : "md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={`grid gap-5 ${gridClass}`}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.title} className="surface-card reveal-on-scroll group relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:shadow-panel">
            <div aria-hidden className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
            {Icon ? (
              <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white ring-8 ring-sky-50 transition group-hover:bg-sky-700">
                <Icon className="h-5 w-5" />
              </span>
            ) : null}
            {item.eyebrow ? (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">{item.eyebrow}</p>
            ) : null}
            <h3 className="text-xl font-semibold tracking-tight text-slate-950 lg:text-[1.35rem]">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
          </article>
        );
      })}
    </div>
  );
}
