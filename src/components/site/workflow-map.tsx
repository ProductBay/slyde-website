import { CheckCircle2, FileSearch, Radar, Send, ShieldCheck, Waypoints } from "lucide-react";

const nodes = [
  {
    title: "Public intake",
    description: "Applications, merchant signals, and documents enter the network through structured website flows.",
    icon: Send,
  },
  {
    title: "Ops review",
    description: "Control tower teams evaluate applicants, documents, and readiness before activation decisions are released.",
    icon: FileSearch,
  },
  {
    title: "Activation",
    description: "Approved Slyders receive access, verify identity, and move into password setup and guided onboarding.",
    icon: ShieldCheck,
  },
  {
    title: "Readiness",
    description: "Legal acceptance, setup details, and operational checks converge into a clear readiness state.",
    icon: Radar,
  },
  {
    title: "Live network",
    description: "Zone launch, courier eligibility, and delivery operations align inside one controlled logistics layer.",
    icon: CheckCircle2,
  },
];

export function WorkflowMap() {
  return (
    <section className="section-shell py-10">
      <div className="workflow-map-shell reveal-on-scroll overflow-hidden rounded-[2rem] border border-slate-200 p-5 text-white shadow-panel sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">Enterprise workflow map</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[2rem]">
              Intake, review, activation, readiness, live operations
            </h2>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-sky-100">
            <Waypoints className="h-4 w-4" />
            Moving connectors, symbolic nodes, real operating flow
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[repeat(5,minmax(0,1fr))] lg:items-start">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <div key={node.title} className="flex flex-col">
                <div className="enterprise-node h-full p-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-sky-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-200/90">Node 0{index + 1}</p>
                      <p className="mt-1 text-base font-semibold text-white">{node.title}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{node.description}</p>
                </div>
                {index < nodes.length - 1 ? <div className="workflow-connector workflow-map-connector my-4 hidden lg:block" /> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
