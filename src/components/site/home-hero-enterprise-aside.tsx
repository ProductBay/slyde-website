import { BriefcaseBusiness, MapPinned, Package, ShieldCheck, Sparkles, Truck, UserRoundCheck, Waypoints } from "lucide-react";

const personas = [
  {
    title: "For merchants",
    body: "Professional delivery operations without building a fleet from scratch.",
    icon: BriefcaseBusiness,
  },
  {
    title: "For Slyders",
    body: "A more structured path into reliable, modern delivery work.",
    icon: UserRoundCheck,
  },
  {
    title: "For customers",
    body: "Cleaner handoffs, better updates, and more confidence after checkout.",
    icon: Sparkles,
  },
];

export function HomeHeroEnterpriseAside() {
  return (
    <div className="dark-panel enterprise-grid reveal-on-scroll relative overflow-hidden p-6 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span
          className="floating-orb absolute left-5 top-8 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sky-300 backdrop-blur"
          style={{ animationDelay: "0s" }}
        >
          <Package className="h-5 w-5" />
        </span>
        <span
          className="floating-orb absolute right-6 top-24 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cyan-200 backdrop-blur"
          style={{ animationDelay: "1.2s" }}
        >
          <Truck className="h-4 w-4" />
        </span>
        <span
          className="floating-orb absolute bottom-32 left-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sky-200 backdrop-blur"
          style={{ animationDelay: "2.1s" }}
        >
          <MapPinned className="h-4 w-4" />
        </span>
        <span
          className="floating-orb absolute bottom-10 right-7 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 backdrop-blur"
          style={{ animationDelay: "0.8s" }}
        >
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="absolute left-[18%] top-[14%] h-28 w-28 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-[16%] right-[12%] h-24 w-24 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>
      <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">Network snapshot</p>
            <p className="mt-2 text-lg font-semibold text-white">A friendlier delivery experience with enterprise structure behind it</p>
          </div>
          <span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            Jamaica first
          </span>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.7rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.2),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.96))] p-4">
          <svg viewBox="0 0 480 320" className="h-auto w-full">
            <defs>
              <linearGradient id="cardGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            <rect x="16" y="24" width="448" height="272" rx="28" fill="url(#cardGlow)" stroke="rgba(255,255,255,0.08)" />

            <rect x="38" y="182" width="124" height="78" rx="22" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.09)" />
            <circle cx="88" cy="122" r="34" fill="#f8fafc" />
            <path d="M58 180c9-27 22-40 39-40s31 13 39 40" fill="#0ea5e9" />
            <rect x="70" y="102" width="36" height="22" rx="10" fill="#0f172a" opacity="0.12" />
            <text x="100" y="216" fill="#e2e8f0" fontSize="16" fontWeight="700" textAnchor="middle">Merchant</text>
            <text x="100" y="236" fill="#94a3b8" fontSize="11" textAnchor="middle">
              <tspan x="100" dy="0">Dispatch-ready</tspan>
              <tspan x="100" dy="14">and confident</tspan>
            </text>

            <rect x="176" y="146" width="128" height="92" rx="24" fill="rgba(14,165,233,0.16)" stroke="rgba(125,211,252,0.3)" />
            <circle cx="240" cy="94" r="36" fill="#fef3c7" />
            <path d="M205 150c8-30 21-44 35-44 15 0 28 14 36 44" fill="#22c55e" />
            <rect x="220" y="78" width="40" height="24" rx="10" fill="#0f172a" opacity="0.14" />
            <path d="M219 61h42l-6 14h-30z" fill="#0f172a" opacity="0.18" />
            <text x="240" y="196" fill="#f8fafc" fontSize="16" fontWeight="700" textAnchor="middle">SLYDE courier</text>
            <text x="240" y="216" fill="#bae6fd" fontSize="11" textAnchor="middle">
              <tspan x="240" dy="0">Tracked routes</tspan>
              <tspan x="240" dy="14">and confident handoffs</tspan>
            </text>

            <rect x="316" y="182" width="126" height="78" rx="22" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.09)" />
            <circle cx="382" cy="126" r="34" fill="#e0f2fe" />
            <path d="M349 182c7-28 20-42 33-42 15 0 29 14 39 42" fill="#2563eb" />
            <path d="M370 124c4 5 8 7 12 7s8-2 12-7" fill="none" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
            <text x="379" y="216" fill="#e2e8f0" fontSize="16" fontWeight="700" textAnchor="middle">Happy customer</text>
            <text x="379" y="236" fill="#94a3b8" fontSize="11" textAnchor="middle">
              <tspan x="379" dy="0">Clear updates</tspan>
              <tspan x="379" dy="14">and trusted delivery</tspan>
            </text>

            <path d="M145 144c28 8 48 10 74 8" stroke="#7dd3fc" strokeWidth="6" strokeLinecap="round" strokeDasharray="10 12" opacity="0.9" />
            <path d="M268 150c29-4 49-2 78 10" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" strokeDasharray="10 12" opacity="0.9" />
            <circle cx="142" cy="143" r="8" fill="#7dd3fc" />
            <circle cx="220" cy="151" r="8" fill="#38bdf8" />
            <circle cx="344" cy="161" r="8" fill="#7dd3fc" />
          </svg>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-300">
        {personas.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="enterprise-node p-4">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 text-sky-300">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{item.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-sky-300" />
          <p className="text-sm font-semibold text-white">Enterprise confidence with human warmth</p>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          SLYDE helps merchants look more professional, gives Slyders a stronger operating path, and creates a friendlier delivery experience for customers from order to handoff.
        </p>
        <div className="mt-4 flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-slate-900/50 px-4 py-3">
          <Waypoints className="h-5 w-5 text-sky-300" />
          <p className="text-sm text-slate-200">Built to feel trusted on the front end and controlled behind the scenes.</p>
        </div>
      </div>
    </div>
  );
}
