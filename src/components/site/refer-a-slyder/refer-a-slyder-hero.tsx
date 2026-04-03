import { Gift, ShieldCheck, UserRoundPlus } from "lucide-react";

const highlights = [
  "Only earn the reward after the referred Slyder is approved, activated, ready, and completes a first live delivery.",
  "Launch reward: JMD 400 off a qualifying SLYDE order.",
  "Not in a live customer zone yet? You can gift the reward one time to a friend or family member in an active zone.",
];

export function ReferASlyderHero() {
  return (
    <section className="section-shell py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Public Referral</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Know a reliable driver? Put them on SLYDE.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Refer someone who should join the SLYDE network. If they go live and complete their first delivery, you earn a
            SLYDE reward. If you are outside a live delivery zone, you can gift that reward one time to a friend or family
            member who already has a valid SLYDE customer account in an active zone.
          </p>
          <div className="mt-8 grid gap-3">
            {highlights.map((item) => (
              <div key={item} className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-600 shadow-soft">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="dark-panel p-6 sm:p-8">
          <div className="grid gap-4">
            {[
              { icon: UserRoundPlus, title: "Refer a driver", body: "Share the details of someone dependable, reachable, and ready to work." },
              { icon: ShieldCheck, title: "SLYDE verifies the milestone", body: "The reward is earned only after approval, activation, readiness, and a first live delivery." },
              { icon: Gift, title: "Claim or gift the reward", body: "If you are outside the active zone footprint, you can transfer the reward one time only." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 text-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
