import { trustStrip } from "@/content/site";

export function TrustStrip() {
  return (
    <section className="section-shell">
      <div className="grid gap-4 rounded-[2rem] border border-white/40 bg-white/75 p-5 shadow-soft backdrop-blur md:grid-cols-2 xl:grid-cols-3">
        {trustStrip.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="group reveal-on-scroll flex gap-4 rounded-3xl border border-slate-200/70 bg-white/78 p-4 transition duration-300 hover:-translate-y-1 hover:shadow-soft">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white ring-8 ring-sky-50 transition group-hover:bg-sky-700">
                <Icon className="h-5 w-5" />
              </span>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-950">{item.title}</h3>
                <p className="text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
