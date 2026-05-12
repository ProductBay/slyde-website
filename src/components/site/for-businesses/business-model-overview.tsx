"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LinkButton } from "@/components/ui/link-button";
import { CheckCircle2, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

type BusinessCopyVariant = "a" | "b";

interface BusinessModelOverviewProps {
  variant?: BusinessCopyVariant;
}

type TierId = "lite" | "business";

const COPY_BY_VARIANT: Record<BusinessCopyVariant, {
  headline: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
}> = {
  a: {
    headline: "A delivery model designed for social sellers and operational businesses.",
    body:
      "SLYDE separates onboarding into practical maturity lanes. Start in Merchant Lite if you are building reliable daily delivery, then graduate to Business when dispatch complexity, team size, and integration needs increase.",
    primaryCta: "Start SLYDE onboarding",
    secondaryCta: "Compare with GrabQuik model",
  },
  b: {
    headline: "Choose the tier that matches your current delivery maturity.",
    body:
      "Merchant Lite supports social-first sellers building consistency. Business supports scaling teams with heavier dispatch flow, stronger support expectations, and integration needs.",
    primaryCta: "Start 60-day trial",
    secondaryCta: "Review GrabQuik path",
  },
};

const tierCards = [
  {
    id: "lite",
    name: "Merchant Lite",
    bestFor: "Social-first sellers validating repeat demand",
    price: "$29/month after trial",
    volume: "Up to 100 monthly orders",
    supportModel: "Standard support",
    recommended: false,
    features: [
      "Up to 100 orders per month",
      "Basic analytics dashboard",
      "Email support",
      "Standard delivery routing",
      "Basic API access",
    ],
    restrictions: [
      "No custom integrations under this tier",
      "Standard support queue and response priority",
      "Best for lean teams and single-operator dispatch workflows",
    ],
  },
  {
    id: "business",
    name: "Business",
    bestFor: "Growing merchants with repeat dispatch volume",
    price: "$79/month after trial",
    volume: "Up to 500 monthly orders",
    supportModel: "Priority support",
    recommended: true,
    features: [
      "Up to 500 orders per month",
      "Advanced analytics",
      "Priority email and chat support",
      "Optimized delivery routing",
      "Full API access and custom integrations",
      "Dedicated account manager",
    ],
    restrictions: [
      "Order cap at 500 per month before scale planning",
      "Integration rollout depends on technical and operational readiness",
      "Best fit for multi-staff operations with stable recurring demand",
    ],
  },
];

const comparisonRows: Array<{ label: string; lite: string; business: string }> = [
  {
    label: "Ideal profile",
    lite: "Social-first operators validating repeat local demand",
    business: "Scaling teams with recurring multi-channel dispatch volume",
  },
  {
    label: "Monthly capacity",
    lite: "Up to 100 orders",
    business: "Up to 500 orders",
  },
  {
    label: "Support lane",
    lite: "Standard support queue",
    business: "Priority email and chat support",
  },
  {
    label: "Integrations",
    lite: "Basic API access",
    business: "Full API access with custom integrations",
  },
  {
    label: "Operational posture",
    lite: "Lean teams with lower complexity",
    business: "Multi-staff operations with structured workflows",
  },
];

const socialWorkflow = [
  "Orders come from Instagram, WhatsApp, and direct messages",
  "Team confirms order and handoff window",
  "Dispatch is requested in SLYDE dashboard or assisted channel",
  "SLYDE handles pickup and final-mile delivery",
  "Merchant tracks performance and repeats the flow",
];

const businessWorkflow = [
  "Orders flow from website, POS, or structured channels",
  "Internal staff validates inventory and fulfillment priority",
  "Dispatch runs through optimized routing and API-ready flows",
  "SLYDE executes pickup, route, and delivery confirmation",
  "Business reviews analytics and scales by location/team",
];

function WorkflowLane({
  title,
  subtitle,
  steps,
  accent,
}: {
  title: string;
  subtitle: string;
  steps: string[];
  accent: "sky" | "slate";
}) {
  const accentClasses =
    accent === "sky"
      ? {
          panel: "border-sky-200 bg-[linear-gradient(145deg,rgba(240,249,255,0.9),rgba(224,242,254,0.55))]",
          badge: "border-sky-200 bg-sky-50 text-sky-800",
          dot: "bg-sky-600",
          line: "from-sky-200 via-sky-300 to-cyan-300",
        }
      : {
          panel: "border-slate-300 bg-[linear-gradient(145deg,rgba(248,250,252,0.96),rgba(226,232,240,0.6))]",
          badge: "border-slate-300 bg-slate-100 text-slate-700",
          dot: "bg-slate-700",
          line: "from-slate-300 via-slate-400 to-slate-300",
        };

  return (
    <div className={`rounded-[1.75rem] border p-6 ${accentClasses.panel}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${accentClasses.badge}`}>
          Workflow lane
        </span>
      </div>
      <p className="mt-2 text-sm leading-7 text-slate-600">{subtitle}</p>

      <div className="relative mt-6">
        <div className={`pointer-events-none absolute left-[15px] top-5 bottom-5 w-[2px] bg-gradient-to-b ${accentClasses.line}`} />
        <div className="grid gap-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className="relative rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-sm"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <span className={`absolute left-[-1.08rem] top-4 inline-flex h-5 w-5 animate-pulse rounded-full border-2 border-white ${accentClasses.dot}`} />
              <p className="pl-3 text-sm text-slate-700">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BusinessModelOverview({ variant = "a" }: BusinessModelOverviewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const copy = COPY_BY_VARIANT[variant];
  const selectedTier = searchParams.get("tier") === "lite" ? "lite" : "business";
  const selectedCard = tierCards.find((tier) => tier.id === selectedTier) ?? tierCards[0];

  function setTierInQuery(nextTier: TierId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tier", nextTier);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <section className="section-shell pb-12 sm:pb-16">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-panel sm:p-8 lg:p-10" data-copy-variant={variant}>
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Business model clarity</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl max-[389px]:text-[1.55rem] max-[389px]:leading-[1.15]">{copy.headline}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base max-[389px]:text-[0.86rem] max-[389px]:leading-6">
            {copy.body}
          </p>
        </div>

        <div className="mt-7 rounded-[1.5rem] border border-emerald-200 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(220,252,231,0.72))] px-5 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">Launch offer</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">60-day free trial on all merchant onboarding tiers</h3>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            No platform fees or commission charges apply during the promotional trial window. Merchants can validate operational fit,
            confirm delivery reliability, and transition into the right paid tier with real data.
          </p>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Tier comparison toggle</p>
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-soft">
              {tierCards.map((tier) => {
                const isActive = selectedTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setTierInQuery(tier.id as TierId)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition max-[389px]:px-2.5 max-[389px]:text-[10px] ${
                      isActive
                        ? "bg-slate-950 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                    aria-pressed={isActive}
                  >
                    {tier.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 max-[389px]:grid-cols-[1fr_1fr] max-[389px]:text-[10px]">
              <div className="px-3 py-2 max-[389px]:hidden">Capability</div>
              <div className={`px-3 py-2 text-center ${selectedTier === "lite" ? "bg-sky-50 text-sky-700" : ""}`}>Merchant Lite</div>
              <div className={`px-3 py-2 text-center ${selectedTier === "business" ? "bg-sky-50 text-sky-700" : ""}`}>Business</div>
            </div>
            {comparisonRows.map((row) => (
              <div key={row.label} className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-slate-100 last:border-b-0 max-[389px]:grid-cols-[1fr_1fr]">
                <div className="px-3 py-2 text-xs font-semibold text-slate-600 max-[389px]:col-span-2 max-[389px]:border-b max-[389px]:border-slate-100 max-[389px]:bg-slate-50 max-[389px]:text-[11px]">{row.label}</div>
                <div className={`px-3 py-2 text-xs leading-5 text-slate-700 max-[389px]:text-[11px] ${selectedTier === "lite" ? "bg-sky-50" : ""}`}>{row.lite}</div>
                <div className={`px-3 py-2 text-xs leading-5 text-slate-700 max-[389px]:text-[11px] ${selectedTier === "business" ? "bg-sky-50" : ""}`}>{row.business}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Selected plan snapshot</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">{selectedCard.name}</span>
            <span className="text-xs font-medium text-sky-700">{selectedCard.price}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700 max-[389px]:text-[0.82rem] max-[389px]:leading-5">{selectedCard.bestFor}</p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {tierCards.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <div
                key={tier.id}
                className={`relative rounded-[1.75rem] ${tier.recommended ? "slyde-gradient-ring p-[1px]" : ""}`}
              >
                <article
                  className={`group relative overflow-hidden rounded-[calc(1.75rem-1px)] border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-26px_rgba(15,23,42,0.42)] ${
                    tier.recommended ? "border-sky-200 shadow-[0_16px_36px_-26px_rgba(14,116,144,0.55)]" : "border-slate-200 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)]"
                  } ${isSelected ? "ring-2 ring-slate-900/15" : ""}`}
                >
                  <div
                    aria-hidden
                    className={`absolute inset-x-0 top-0 h-1.5 ${tier.recommended ? "bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-400" : "bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300"}`}
                  />

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{tier.name}</p>
                        <p className="mt-2 text-xl font-semibold leading-tight text-slate-950 max-[389px]:text-[1.06rem]">{tier.bestFor}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {tier.recommended ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700 max-[389px]:px-2.5 max-[389px]:text-[10px]">
                            <Sparkles className="h-3.5 w-3.5" />
                            Recommended
                          </span>
                        ) : null}
                        {isSelected ? (
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">Selected</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-sky-700 max-[389px]:text-sm">{tier.price}</p>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 max-[389px]:text-[11px]">60-day free trial first</span>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 max-[389px]:text-[10px]">Capacity</p>
                        <p className="mt-1 text-sm font-medium text-slate-800 max-[389px]:text-[0.8rem]">{tier.volume}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 max-[389px]:text-[10px]">Support lane</p>
                        <p className="mt-1 text-sm font-medium text-slate-800 max-[389px]:text-[0.8rem]">{tier.supportModel}</p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4">
                      <div>
                        <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 max-[389px]:text-[0.8rem]">
                          <TrendingUp className="h-4 w-4 text-emerald-600" />
                          Included
                        </h4>
                        <ul className="mt-2 space-y-2 text-sm text-slate-700 max-[389px]:text-[0.8rem]">
                          {tier.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 max-[389px]:px-2.5 max-[389px]:py-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 max-[389px]:text-[0.8rem]">
                          <ShieldAlert className="h-4 w-4 text-amber-700" />
                          Restrictions and boundaries
                        </h4>
                        <ul className="mt-2 space-y-2 text-sm text-slate-700 max-[389px]:text-[0.8rem]">
                          {tier.restrictions.map((restriction) => (
                            <li key={restriction} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 max-[389px]:px-2.5 max-[389px]:py-2">{restriction}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Commercial and policy notes</p>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
            <li>Paid plan billing begins after the 60-day promotional period, unless replaced by a signed written offer.</li>
            <li>Final fees, commissions, and tier limits are governed by the Merchant Partner Agreement and onboarding disclosures.</li>
            <li>Feature availability can vary by operational readiness, service area coverage, and compliance requirements.</li>
            <li>Restricted goods, fraudulent use, and policy violations can lead to account suspension or termination.</li>
          </ul>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <WorkflowLane
            title="Social Seller Workflow"
            subtitle="Best for Instagram and WhatsApp-driven sellers who need structure without heavy technical setup."
            steps={socialWorkflow}
            accent="sky"
          />
          <WorkflowLane
            title="Business Seller Workflow"
            subtitle="Best for merchants with multi-staff operations, recurring order volume, and integration plans."
            steps={businessWorkflow}
            accent="slate"
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/for-businesses/apply/slyde">{copy.primaryCta}</LinkButton>
          <LinkButton href="/for-businesses/grabquik" variant="secondary">{copy.secondaryCta}</LinkButton>
        </div>
      </div>
    </section>
  );
}
