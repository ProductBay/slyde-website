import { Activity, MapPinned, RadioTower, UsersRound } from "lucide-react";

const hotspotParishes = [
  {
    parish: "Kingston",
    towns: ["Downtown Kingston", "Half-Way Tree", "Cross Roads"],
    signal: "Launch watch",
    signalTone: "bg-sky-50 text-sky-700 border-sky-100",
    description: "Courier interest is already concentrated here, with applications and merchant conversations building around dense delivery corridors.",
  },
  {
    parish: "St Andrew",
    towns: ["Constant Spring", "Papine", "Portmore Edge Corridors"],
    signal: "Early applications",
    signalTone: "bg-emerald-50 text-emerald-700 border-emerald-100",
    description: "High commuter and retail movement makes this a natural operating extension as SLYDE shapes launch-ready courier pockets.",
  },
  {
    parish: "St Thomas",
    towns: ["Morant Bay", "Yallahs", "Seaforth"],
    signal: "Interest building",
    signalTone: "bg-amber-50 text-amber-700 border-amber-100",
    description: "SLYDE is monitoring early courier interest here so eastern routes can be developed with stronger local readiness over time.",
  },
  {
    parish: "Portland",
    towns: ["Port Antonio", "Buff Bay", "Hope Bay"],
    signal: "Network scouting",
    signalTone: "bg-slate-100 text-slate-700 border-slate-200",
    description: "This parish is being watched for strategic hotspot growth, especially around tourism, town movement, and local merchant demand.",
  },
  {
    parish: "St Mary",
    towns: ["Port Maria", "Annotto Bay", "Oracabessa"],
    signal: "Interest building",
    signalTone: "bg-amber-50 text-amber-700 border-amber-100",
    description: "Courier awareness is being cultivated in St Mary so launch posture can strengthen along active town and highway links.",
  },
  {
    parish: "St Ann",
    towns: ["Ocho Rios", "St Ann's Bay", "Runaway Bay"],
    signal: "Early applications",
    signalTone: "bg-emerald-50 text-emerald-700 border-emerald-100",
    description: "Tourism and retail density make St Ann a visible hotspot for early Slyder applications and merchant-side interest.",
  },
  {
    parish: "Trelawny",
    towns: ["Falmouth", "Wakefield", "Duncans"],
    signal: "Interest building",
    signalTone: "bg-amber-50 text-amber-700 border-amber-100",
    description: "SLYDE is framing Trelawny as an emerging logistics corridor as more courier participation starts to gather around growth towns.",
  },
  {
    parish: "St James",
    towns: ["Montego Bay", "Anchovy", "Ironshore"],
    signal: "Launch watch",
    signalTone: "bg-sky-50 text-sky-700 border-sky-100",
    description: "Montego Bay remains one of the most visible rollout hotspots, with onboarding activity reinforcing a stronger launch case.",
  },
  {
    parish: "Hanover",
    towns: ["Lucea", "Sandy Bay", "Hopewell"],
    signal: "Network scouting",
    signalTone: "bg-slate-100 text-slate-700 border-slate-200",
    description: "Hanover is being positioned as a west-coast growth parish where early courier interest can mature into stronger readiness later.",
  },
  {
    parish: "Westmoreland",
    towns: ["Savanna-la-Mar", "Negril", "Whithorn"],
    signal: "Early applications",
    signalTone: "bg-emerald-50 text-emerald-700 border-emerald-100",
    description: "Courier and tourism-linked movement makes Westmoreland a meaningful parish for early application momentum and hotspot watching.",
  },
  {
    parish: "St Elizabeth",
    towns: ["Santa Cruz", "Black River", "Southfield"],
    signal: "Interest building",
    signalTone: "bg-amber-50 text-amber-700 border-amber-100",
    description: "SLYDE is shaping local visibility here so courier formation can expand outward from known town and market routes.",
  },
  {
    parish: "Manchester",
    towns: ["Mandeville", "Christiana", "Porus"],
    signal: "Launch watch",
    signalTone: "bg-sky-50 text-sky-700 border-sky-100",
    description: "Manchester remains a clear focus area, with Mandeville continuing to signal strong need and visible network-building opportunity.",
  },
  {
    parish: "Clarendon",
    towns: ["May Pen", "Chapelton", "Lionel Town"],
    signal: "Interest building",
    signalTone: "bg-amber-50 text-amber-700 border-amber-100",
    description: "Clarendon is being tracked as a central parish where courier interest and merchant movement can support future readiness growth.",
  },
  {
    parish: "St Catherine",
    towns: ["Spanish Town", "Old Harbour", "Linstead"],
    signal: "Early applications",
    signalTone: "bg-emerald-50 text-emerald-700 border-emerald-100",
    description: "St Catherine is positioned as a major network feeder zone, with strong population density and multiple town-level growth points.",
  },
];

export function ParishHotspotBoard() {
  return (
    <section className="section-shell py-10">
      <div className="surface-panel reveal-on-scroll p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Parish hotspot watch</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.35rem]">
              Courier interest is forming across towns in all 14 parishes
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              SLYDE is not presenting every parish as live. This board shows where courier attention, early applications, merchant visibility, and launch-watch signals are being built so Jamaica-wide readiness can grow with more discipline.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="surface-card p-4">
                <div className="flex items-center gap-3">
                  <UsersRound className="h-5 w-5 text-sky-700" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">14 parishes tracked</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">Island-wide hotspot monitoring</p>
                  </div>
                </div>
              </div>
              <div className="surface-card p-4">
                <div className="flex items-center gap-3">
                  <RadioTower className="h-5 w-5 text-emerald-700" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Growth posture</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">Interest, applications, launch watch</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {hotspotParishes.map((item, index) => (
              <div key={item.parish} className={`surface-card reveal-on-scroll stagger-${(index % 6) + 1} p-5`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">{item.parish}</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">{item.towns.join(" • ")}</h3>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${item.signalTone}`}>
                    {item.signal}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-slate-500">
                  <MapPinned className="h-4 w-4 text-sky-700" />
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">Hotspot towns under active visibility</p>
                </div>

                <div className="workflow-connector mt-4" />

                <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  <Activity className="h-3.5 w-3.5 text-emerald-600" />
                  Slyder momentum forming
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
