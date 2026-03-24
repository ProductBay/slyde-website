import type { Metadata } from "next";
import { ArrowRight, BriefcaseBusiness, MapPinned, Radar, ShieldCheck, UsersRound, Waypoints } from "lucide-react";
import { CTASection } from "@/components/site/cta-section";
import { HeroSection } from "@/components/site/hero-section";
import { SectionHeading } from "@/components/site/section-heading";
import { LinkButton } from "@/components/ui/link-button";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Grow Your Area",
  "Learn how the future SLYDE Area Builder Rewards program will help Slyders grow courier strength in their parish and unlock commission-free reward windows.",
  "/grow-your-area",
);

const principles = [
  {
    eyebrow: "Built for growth",
    title: "Help build courier density where it matters",
    description: "The program is designed to encourage approved Slyders to help expand trustworthy courier participation in the towns and parishes where SLYDE is actively building network strength.",
    icon: UsersRound,
  },
  {
    eyebrow: "No cash payout",
    title: "Rewards are tied to your own work on the platform",
    description: "Instead of cash affiliate commissions, SLYDE plans to reward successful growth with temporary 0% platform commission windows on your own eligible deliveries.",
    icon: ShieldCheck,
  },
  {
    eyebrow: "Area-first logic",
    title: "Priority towns can unlock stronger reward windows",
    description: "Hotspot towns and under-covered parishes can receive stronger reward settings so the platform grows where courier strength is most needed.",
    icon: MapPinned,
  },
  {
    eyebrow: "Operational control",
    title: "This is a network-building system, not generic referral spam",
    description: "Only quality referrals that move into real onboarding, approval, activation, and readiness should qualify a reward.",
    icon: Radar,
  },
];

const milestones = [
  "A Slyder shares a referral code or invite link from the SLYDE app.",
  "A new applicant applies through the public SLYDE website with that referral attached.",
  "SLYDE reviews, approves, and activates the referred applicant through the normal onboarding process.",
  "Once the referred applicant reaches the required activation milestone, the referrer unlocks a commission-free reward window.",
];

const rewardExamples = [
  {
    label: "Standard growth area",
    value: "5 days or 10 deliveries",
    description: "Recommended default reward window for normal towns and parishes in active network build.",
  },
  {
    label: "Priority growth town",
    value: "7 days or 15 deliveries",
    description: "Recommended stronger reward for under-covered areas where SLYDE wants to accelerate local courier density.",
  },
  {
    label: "Strategic launch area",
    value: "Town-based multiplier",
    description: "Ops can configure stronger reward settings for towns that are especially important to launch readiness.",
  },
];

const guardrails = [
  "Only approved and active Slyders should be eligible to refer.",
  "No self-referrals or duplicate phone/email/identity referrals should qualify.",
  "Referral rewards should only unlock after meaningful activation milestones are completed.",
  "Eligible deliveries only: canceled, test, refunded, or fraud-flagged orders should not consume or qualify rewards.",
];

export default function GrowYourAreaPage() {
  return (
    <>
      <HeroSection
        eyebrow="Grow Your Area"
        title="A future SLYDE program for Slyders who help grow courier strength in their parish"
        description="The Area Builder Rewards concept is designed to let approved Slyders help expand the network in their own towns and unlock commission-free reward windows when quality referrals become real operational couriers."
        supportText="Structured growth. Quality referrals. Stronger launch readiness."
        actions={[
          { href: "/become-a-slyder/apply", label: "Apply to Become a Slyder" },
          { href: "/coverage", label: "Check Coverage Hotspots", variant: "secondary" },
        ]}
        aside={
          <div className="dark-panel p-6 sm:p-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-200">Future program shape</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Grow your area, then earn more from your own work</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                "The public website captures referral attribution during application.",
                "The SLYDE app will own validation, milestones, and reward logic.",
                "The strongest version of the program rewards quality activation, not raw signups.",
                "Priority towns can unlock stronger growth incentives as the network expands.",
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        }
      />

      <section className="section-shell py-16">
        <SectionHeading
          eyebrow="Why This Exists"
          title="The fastest network growth comes from trusted local relationships"
          description="SLYDE wants courier density in the right towns, not just more signups. A structured area-builder model gives approved Slyders a way to help build readiness in the places they know best."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {principles.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={`surface-card reveal-on-scroll stagger-${index + 1} p-6`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">{item.eyebrow}</p>
                    <h3 className="mt-3 text-lg font-semibold text-slate-950">{item.title}</h3>
                  </div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-shell py-16">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <SectionHeading
            eyebrow="How It Would Work"
            title="The public website starts the referral trail, but the SLYDE app owns the reward system"
            description="This keeps the program clean: the website captures referral attribution during onboarding, while the SLYDE app later validates the referral, tracks milestones, and manages the commission-free reward."
          />
          <div className="surface-panel p-8">
            <div className="grid gap-3">
              {milestones.map((item, index) => (
                <div key={item} className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-surface-1 px-4 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">{index + 1}</span>
                  <p className="text-sm leading-7 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <Waypoints className="h-5 w-5 text-sky-700" />
                <p className="text-sm font-semibold text-slate-950">System split</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Website role: capture referral code or invite link during application. App role: validate referral, detect duplicates, qualify rewards, and apply 0% commission windows on eligible deliveries.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-16">
        <SectionHeading
          eyebrow="Reward Model"
          title="The reward is not cash. It is extra earning power on the platform."
          description="This is the recommended model because it keeps cash inside the business, rewards real activity, and aligns the referrer with long-term platform use."
          align="center"
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {rewardExamples.map((item, index) => (
            <div key={item.label} className={`surface-card reveal-on-scroll stagger-${index + 1} p-6`}>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">{item.label}</p>
              <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">{item.value}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell py-16">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <SectionHeading
            eyebrow="Program Guardrails"
            title="This only works if the quality controls are strict"
            description="The Area Builder concept should strengthen the network, not create noise. That means the reward system has to be tied to real onboarding and anti-abuse rules."
          />
          <div className="surface-panel p-8">
            <div className="grid gap-3">
              {guardrails.map((item) => (
                <div key={item} className="rounded-3xl border border-slate-200 bg-surface-1 px-4 py-4 text-sm leading-7 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/coverage" variant="secondary">
                See Coverage Momentum
              </LinkButton>
              <LinkButton href="/become-a-slyder/apply">
                Start Your Slyder Application <ArrowRight className="h-4 w-4" />
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Prepare For Area Builder Rewards"
        title="The best way to benefit later is to become an approved Slyder first"
        description="Apply now, move through onboarding, and position yourself for future network-building rewards once the program is activated inside the SLYDE app."
        actions={[
          { href: "/become-a-slyder/apply", label: "Apply as a Slyder", variant: "primary" },
          { href: "/coverage", label: "Explore Coverage Areas", variant: "secondary" },
        ]}
      />
    </>
  );
}
