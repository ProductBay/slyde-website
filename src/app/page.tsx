import { ArrowRight, Boxes, BriefcaseBusiness, Cable, FileCheck2, Globe2, MapPinned, Radar, ShieldCheck, ShieldEllipsis, Sparkles, UserRoundCheck, Waypoints, Workflow } from "lucide-react";
import { AnimatedCount } from "@/components/site/animated-count";
import { CTASection } from "@/components/site/cta-section";
import { CoverageSection } from "@/components/site/coverage-section";
import { HeroSection } from "@/components/site/hero-section";
import { InfoCardGrid } from "@/components/site/info-card-grid";
import { PathSelector } from "@/components/site/path-selector";
import { ProcessTimeline } from "@/components/site/process-timeline";
import { ReadinessBoard } from "@/components/site/readiness-board";
import { SectionHeading } from "@/components/site/section-heading";
import { SlyderPaymentsHighlightSection } from "@/components/site/slyder-payments-highlight-section";
import { TrustStrip } from "@/components/site/trust-strip";
import { TrustPillarsRow } from "@/components/site/trust-pillars-row";
import { WorkflowMap } from "@/components/site/workflow-map";
import { heroMetrics, homeSolutions, howSlydeWorks } from "@/content/site";
import { LinkButton } from "@/components/ui/link-button";

const businessReasons = [
  {
    title: "Skip fleet build-out",
    description: "Launch delivery operations without the overhead of recruiting, managing, and dispatching an internal fleet.",
  },
  {
    title: "Gain delivery visibility",
    description: "Monitor jobs through a tracked lifecycle instead of operating through blind handoffs and manual updates.",
  },
  {
    title: "Scale with demand",
    description: "Use SLYDE as a fulfillment layer that grows across order peaks, merchant expansion, and multi-zone operations.",
  },
  {
    title: "Build customer confidence",
    description: "Proof of delivery, live status updates, and clear operating controls improve the post-purchase experience.",
  },
];

const safetyCards = [
  {
    eyebrow: "Verified network",
    title: "Slyder checks before activation",
    description: "Applicants move through document review and readiness checks before they receive account activation.",
    icon: ShieldCheck,
  },
  {
    eyebrow: "Tracked operations",
    title: "Every job follows a visible delivery lifecycle",
    description: "From dispatch to confirmation, SLYDE is structured around event-based delivery progression.",
    icon: Workflow,
  },
  {
    eyebrow: "Coverage confidence",
    title: "Jamaica-first service design with future regional standards",
    description: "The network is being launched with realistic service-area control and a path to Caribbean expansion.",
    icon: MapPinned,
  },
  {
    eyebrow: "Integration layer",
    title: "API-ready logistics architecture",
    description: "SLYDE is positioned to support merchant systems, partner platforms, and delivery orchestration workflows.",
    icon: Cable,
  },
];

const whyNowSignals = [
  {
    title: "Jamaica delivery demand is rising",
    description: "Merchant and courier readiness need a coordinated launch surface, not fragmented ad-hoc logistics.",
    value: 3,
    suffix: "x",
    label: "launch-stage growth pressure",
  },
  {
    title: "Internal fleet models are inefficient",
    description: "Businesses want delivery capability without absorbing recruiting, dispatch, and utilization risk alone.",
    value: 42,
    suffix: "%",
    label: "operational overhead avoided",
  },
  {
    title: "SLYDE is building controlled infrastructure",
    description: "The network is being shaped around verification, readiness, and launch control instead of loose marketplace behavior.",
    value: 4,
    suffix: "",
    label: "core operating layers",
  },
];

const architectureLayers = [
  {
    label: "Public platform",
    title: "Brand, coverage, and trust surface",
    description: "Explain the network, service areas, and enterprise posture through a clean public operating interface.",
    icon: Globe2,
  },
  {
    label: "Courier onboarding",
    title: "Structured Slyder intake and activation",
    description: "Capture applications, documents, review state, activation, setup, and readiness in one controlled pipeline.",
    icon: UserRoundCheck,
  },
  {
    label: "Business acquisition",
    title: "Merchant demand and delivery positioning",
    description: "Present SLYDE as a scalable delivery layer for restaurants, retail, pharmacy, and enterprise operations.",
    icon: BriefcaseBusiness,
  },
  {
    label: "Integration layer",
    title: "API-ready orchestration path",
    description: "Prepare for platform connectivity, event-driven delivery updates, and partner-side operational sync.",
    icon: Boxes,
  },
];

const enterpriseLabels = [
  { label: "Courier Network", icon: UserRoundCheck },
  { label: "Merchant Layer", icon: BriefcaseBusiness },
  { label: "Launch Control", icon: Radar },
  { label: "Integration Ready", icon: Cable },
];

const footerLayers = [
  {
    title: "Control layer",
    description: "Review, activation, and operating decisions stay structured.",
  },
  {
    title: "Launch layer",
    description: "Zone readiness and merchant demand shape where SLYDE goes live.",
  },
  {
    title: "Network layer",
    description: "Couriers, merchants, and future integrations converge in one system.",
  },
];

export default function HomePage() {
  return (
    <>
      <HeroSection
        eyebrow="SLYDE Logistics Network"
        title="Delivery infrastructure for modern Jamaica"
        description="SLYDE powers fast, reliable delivery for businesses while building a new generation of independent couriers across the island."
        supportText="Built for Jamaica first. Designed to scale across the Caribbean."
        actions={[
          { href: "/become-a-slyder/apply", label: "Become a Slyder" },
          { href: "/for-businesses", label: "Partner with SLYDE", variant: "secondary" },
        ]}
        metrics={heroMetrics}
        aside={
          <div className="dark-panel enterprise-grid reveal-on-scroll overflow-hidden p-6 sm:p-8">
            <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-sky-200">Operational flow</p>
                <p className="mt-2 text-lg font-semibold">Public website to dispatch-ready network</p>
              </div>
              <div className="floating-orb rounded-2xl border border-sky-300/20 bg-sky-400/10 p-3">
                <Workflow className="h-8 w-8 text-sky-300" />
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-sm text-slate-300">
              {[
                {
                  icon: FileCheck2,
                  title: "Structured intake",
                  body: "Applications, documents, and business inquiries enter a controlled public review flow.",
                },
                {
                  icon: ShieldEllipsis,
                  title: "Approval gating",
                  body: "Approved Slyders move into activation, setup, document review, and readiness controls.",
                },
                {
                  icon: Radar,
                  title: "Launch orchestration",
                  body: "Zones, merchant demand, and courier readiness align before SLYDE enables operations.",
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="enterprise-node p-4">
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 text-sky-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/90">Stage 0{index + 1}</p>
                        <p className="mt-2 text-base font-semibold text-white">{item.title}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{item.body}</p>
                      </div>
                    </div>
                    {index < 2 ? <div className="workflow-connector mt-4" /> : null}
                  </div>
                );
              })}
            </div>
            <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Waypoints className="h-5 w-5 text-sky-300" />
                <p className="text-sm font-semibold text-white">Enterprise posture</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                SLYDE is being shaped as an operations-grade logistics surface: verified participants, symbolic workflow controls, and future integration readiness without changing the core public website architecture.
              </p>
            </div>
          </div>
        }
      />

      <TrustStrip />

      <SlyderPaymentsHighlightSection
        title="Built for smarter payouts and safer errands"
        description="SLYDE is building a modern delivery and errands network designed for Jamaica. We want Slyders to operate with more confidence, better earnings visibility, and less dependence on risky cash-heavy workflows. With digital-first payout support and structured errand payment systems, SLYDE is preparing delivery partners for a more professional, more secure way to work."
        cards={[
          {
            id: "faster-payout-ready",
            title: "Faster payout-ready operations",
            body: "We are building payout support that helps eligible Slyders access earnings more smoothly and track payout status with greater clarity.",
          },
          {
            id: "safer-errand-payments",
            title: "Safer errand payment handling",
            body: "For errands that require in-person purchases or bill payments, SLYDE is designing proof-backed workflows that reduce confusion and improve accountability.",
          },
          {
            id: "better-earnings-visibility",
            title: "Better earnings visibility",
            body: "Slyders should be able to understand what they earned, what is pending, and how their payout setup supports day-to-day operations.",
          },
        ]}
        primaryCta={{ label: "Learn about Slyder payouts", href: "/slyder-payouts" }}
        secondaryCta={{ label: "Become a Slyder", href: "/become-a-slyder" }}
      />

      <TrustPillarsRow
        sectionId="home-slyder-payments-trust-strip"
        items={[
          { id: "supported-digital-payout-workflows", label: "Supported digital payout workflows" },
          { id: "trusted-onboarding", label: "Trusted onboarding" },
          { id: "safer-errand-systems", label: "Safer errand systems" },
          { id: "future-ready-slyders", label: "Built for future-ready Slyders" },
        ]}
      />

      <PathSelector />

      <section className="section-shell py-8">
        <div className="surface-panel reveal-on-scroll overflow-hidden p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Why now</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.4rem]">
                Jamaica needs launch-ready logistics infrastructure, not another generic delivery front end
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                Delivery demand is rising, merchant operations are under pressure, and internal fleet models are expensive to scale. SLYDE is positioning itself as a controlled network with clearer readiness, stronger trust, and future integration discipline.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {whyNowSignals.map((item, index) => (
                <div key={item.title} className={`surface-card reveal-on-scroll stagger-${index + 1} p-5`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">{item.title}</p>
                  <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                    <AnimatedCount value={item.value} suffix={item.suffix} />
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ReadinessBoard />

      <section className="section-shell py-4">
        <div className="surface-card reveal-on-scroll overflow-hidden p-4">
          <div className="grid gap-3 md:grid-cols-4">
            {enterpriseLabels.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={`flex items-center gap-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 px-4 py-4 reveal-on-scroll stagger-${index + 1}`}>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sky-700">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="What Is SLYDE"
            title="What is SLYDE?"
            description="SLYDE is a modern delivery network designed to help businesses move goods more reliably while giving independent couriers access to a smarter, more structured way to work."
          />
          <div className="surface-panel p-8">
            <p className="mb-6 max-w-3xl text-sm leading-7 text-slate-600">
              We are building more than a delivery app. SLYDE is a coordinated product architecture with distinct surfaces for public demand, courier onboarding, merchant acquisition, and integration-ready operations.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {architectureLayers.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className={`surface-card reveal-on-scroll stagger-${index + 1} p-5`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">{item.label}</p>
                        <h3 className="mt-3 text-lg font-semibold text-slate-950">{item.title}</h3>
                      </div>
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <div className="workflow-connector mt-4" />
                    <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="How SLYDE Works"
            title="Built around dispatch control and delivery confirmation"
            description="SLYDE gives businesses, Slyders, and future partners a clear operational flow from order creation to proof of delivery."
          />
          <ProcessTimeline steps={howSlydeWorks} />
        </div>
      </section>

      <WorkflowMap />

      <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Solutions"
          title="Different entry points, one coordinated network"
          description="SLYDE has to work for couriers, merchants, platform teams, and future enterprise operators. The website is built to communicate each path clearly."
          align="center"
        />
        <div className="mt-10">
          <InfoCardGrid items={homeSolutions} columns="four" />
        </div>
      </section>

      <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionHeading
            eyebrow="Why Businesses Choose SLYDE"
            title="A scalable delivery layer without internal fleet overhead"
            description="Businesses choose SLYDE when they need same-day and on-demand delivery support, live visibility, and a stronger customer handoff without building a fleet from scratch."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {businessReasons.map((item, index) => (
              <div key={item.title} className={`surface-card reveal-on-scroll stagger-${index + 1} p-6`}>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
                    <Sparkles className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CoverageSection />

      <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="Safety And Reliability"
            title="Built for reliability from day one"
            description="SLYDE combines verification, controlled status progression, and proof-of-delivery support to create a more reliable logistics experience."
          />
          <InfoCardGrid items={safetyCards} columns="four" />
        </div>
      </section>

      <section className="section-shell py-6">
        <div className="dark-panel reveal-on-scroll overflow-hidden p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {footerLayers.map((item, index) => (
              <div key={item.title} className={`enterprise-node reveal-on-scroll stagger-${index + 1} p-5`}>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-200">{item.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Join The Network"
        title="Join the next wave of delivery in Jamaica"
        description="Whether you want to become a Slyder or prepare your business for modern delivery operations, SLYDE is building the network now."
        actions={[
          { href: "/become-a-slyder/apply", label: "Apply as a Slyder", variant: "primary" },
          { href: "/for-businesses", label: "Partner with SLYDE", variant: "secondary" },
          { href: "/api-integrations", label: "Explore API Integrations", variant: "ghost" },
        ]}
      />

      <section className="mx-auto max-w-shell px-4 pb-6 sm:px-6 lg:px-8">
        <div className="surface-card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Need immediate next steps?</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">Choose the right entry point for your role in the network.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/contact" variant="secondary">
              Contact SLYDE
            </LinkButton>
            <LinkButton href="/faq">
              Visit FAQ <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
