import Image from "next/image";
import { ArrowRight, Cable, Gift, MapPinned, ShieldCheck, Users, Workflow } from "lucide-react";
import { AnimatedCount } from "@/components/site/animated-count";
import { CTASection } from "@/components/site/cta-section";
import { CoverageSection } from "@/components/site/coverage-section";
import { HomeHeroActionStrip, HomeHeroFastAccessBar, HomeHeroSlideshow } from "@/components/site/home-hero-slideshow";
import { HomeReferralBanner } from "@/components/site/home-referral-banner";
import { InfoCardGrid } from "@/components/site/info-card-grid";
import { NetworkFlipCards } from "@/components/site/network-flip-cards";
import { IndustrySectors } from "@/components/site/industry-sectors";
import { HomeWalletBanner } from "@/components/site/home-wallet-banner";
import { PathSelector } from "@/components/site/path-selector";
import { ProcessTimeline } from "@/components/site/process-timeline";
import { SectionHeading } from "@/components/site/section-heading";
import { TrustStrip } from "@/components/site/trust-strip";
import { WorkflowMap } from "@/components/site/workflow-map";
import { homeSolutions, howSlydeWorks } from "@/content/site";
import { LinkButton } from "@/components/ui/link-button";

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

const referralSignals = [
  {
    title: "Grow your area",
    description: "Help bring more qualified couriers into the zones that need stronger launch readiness.",
    icon: Users,
  },
  {
    title: "Track every referral",
    description: "Follow each person from referral to application, onboarding progress, and reward readiness.",
    icon: Workflow,
  },
  {
    title: "Earn structured rewards",
    description: "Referral value is tied to real activation and first-delivery milestones, not empty signups.",
    icon: Gift,
  },
];

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.6-1.5H16V5.1c-.5-.1-1.4-.1-2.3-.1-2.3 0-3.8 1.4-3.8 4V11H7.5v3h2.4v7h3.6Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.25" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M14.7 3c.4 1.3 1.2 2.3 2.5 3 .8.4 1.6.7 2.5.7v2.8c-1.4 0-2.7-.4-3.8-1.1v6.1c0 3.3-2.3 5.5-5.4 5.5-2.9 0-5.2-2.2-5.2-5 0-3.1 2.5-5.3 5.7-5.1v2.8c-1.6-.2-2.8.8-2.8 2.3 0 1.3 1.1 2.3 2.4 2.3 1.5 0 2.4-1 2.4-2.8V3h1.7Z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      {/* â”€â”€ 1. HERO SLIDESHOW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
           Full-width, audience-targeted slides. Answers: "What is this?"
           Slide 1: Brand  |  Slide 2: For Businesses  |  Slide 3: For Slyders
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <HomeHeroSlideshow />
      <HomeHeroActionStrip />
      <HomeHeroFastAccessBar />

      {/* ── FULL-WIDTH BANNER ──────────────────────────────────────────── */}
      <section className="w-full mt-10">
        <Image
          src="/images/slyde-merchant-lite.png"
          alt="A'dash Wallet — Powering Payments, Growing Businesses"
          width={1920}
          height={540}
          className="w-full h-auto block"
          priority={false}
        />
      </section>

      <section className="relative z-10 mx-auto mt-0 max-w-shell px-4 pb-12 sm:-mt-1 sm:px-6 lg:-mt-2 lg:px-8">
        <div className="overflow-hidden rounded-b-[1.6rem] border border-slate-200 bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.4)]">
          <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700">
                  Merchant-Lite
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Fast merchant onboarding</span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
                Introducing Merchant-Lite
              </h2>
              <p className="mt-2 max-w-3xl text-base font-medium leading-7 text-slate-700 sm:text-[1.02rem]">
                Plug SLYDE into your social media store without having any website!
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-[0.95rem]">
                A streamlined setup for businesses that want SLYDE-managed delivery support, a cleaner launch path, and less operational overhead from day one.
              </p>
            </div>
            <div className="relative flex flex-col gap-3 sm:flex-row lg:flex-shrink-0 lg:items-center">
              <div className="pointer-events-none relative h-14 w-[170px] self-start overflow-visible sm:mr-2 sm:self-center">
                <div className="floating-orb absolute left-0 top-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50 via-white to-blue-100 text-[#1877F2] shadow-[0_16px_30px_-18px_rgba(24,119,242,0.55)]">
                  <FacebookIcon className="h-4 w-4" />
                </div>
                <div className="floating-orb absolute left-12 top-0 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-fuchsia-200/80 bg-[radial-gradient(circle_at_30%_30%,#fdf497_0%,#fdf497_12%,#fd5949_42%,#d6249f_68%,#285AEB_100%)] text-white shadow-[0_18px_34px_-18px_rgba(214,36,159,0.55)] [animation-delay:0.7s]">
                  <InstagramIcon className="h-4 w-4" />
                </div>
                <div className="floating-orb absolute left-28 top-5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-900/80 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-cyan-300 shadow-[0_16px_30px_-18px_rgba(8,145,178,0.55)] [animation-delay:1.4s]">
                  <TikTokIcon className="h-4 w-4" />
                </div>
              </div>
              <LinkButton href="/for-businesses/apply/slyde" className="justify-center" icon={<ArrowRight className="h-4 w-4" />}>
                Sign up for Merchant-Lite
              </LinkButton>
              <LinkButton href="/for-businesses" variant="secondary" className="justify-center">
                Learn more
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. INDUSTRIES WE SERVE ──────────────────────────────────────
           Interactive hover grid of target verticals.
           Answers: "Does SLYDE serve my industry?"
      ──────────────────────────────────────────────────────────────────── */}
      <IndustrySectors />

      {/* â”€â”€ 5. DUAL-AUDIENCE VALUE PROPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
           Side-by-side: For Businesses / For Slyders.
           Answers: "What are the specific benefits for me?"
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="mx-auto max-w-shell px-4 py-4 pb-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Built for both sides of the network"
          title="Different roles, one coordinated system"
          description="Whether you run a business or work independently as a courier, SLYDE gives you a more structured, more professional way to operate."
          align="center"
        />
        <div className="mt-10">
          <NetworkFlipCards />
        </div>
      </section>

      {/* â”€â”€ 3. TRUST STRIP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
           Immediate credibility signals beneath the fold break.
           Answers: "Can I trust this network?"
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <TrustStrip />

      {/* â”€â”€ 4. PATH SELECTOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
           Role self-identification: Slyder / Merchant / Platform.
           Answers: "Is this for me?"
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {/* ── INDEPENDENT NETWORK STRIP ───────────────────────────────────────── */}
      <section className="mx-auto max-w-shell px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_45px_-38px_rgba(15,23,42,0.6)]">
          <Image
            src="/images/our-vision.png"
            alt="SLYDE Logistics network vision for Jamaica"
            width={1920}
            height={540}
            className="h-[115px] w-full object-cover object-center sm:h-[145px] lg:h-[175px]"
            priority={false}
          />
        </div>
      </section>

      {/* ── SIMPLE VISION CTA SECTION ───────────────────────────────────────── */}
      <section className="mx-auto max-w-shell px-4 pb-8 pt-2 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-6 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.45)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Our Vision &amp; Mission for Jamaica</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Built by Jamaicans, for Jamaicans.
          </h3>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            We are building a trusted local delivery infrastructure that creates jobs, supports businesses, and keeps more value in Jamaica. Join us and help shape a stronger, more connected future for every parish.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="https://adash.technology" className="justify-center">
              Learn More
            </LinkButton>
            <LinkButton href="https://adash.technology" variant="secondary" className="justify-center">
              CAT
            </LinkButton>
            <LinkButton href="/become-a-slyder/apply" variant="secondary" className="justify-center">
              Become a Slyder
            </LinkButton>
            <LinkButton href="/for-businesses" variant="secondary" className="justify-center">
              Become a Merchant
            </LinkButton>
            <LinkButton href="/contact" variant="secondary" className="justify-center">
              Be an Investor
            </LinkButton>
          </div>
        </div>
      </section>

      {/* â”€â”€ 11. WHY NOW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
           Market signals for enterprise / partner audience.
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      <PathSelector />

      <HomeReferralBanner />

      <section className="section-shell py-8">
        <div className="surface-panel reveal-on-scroll overflow-hidden p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Referral Network</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.3rem]">
                Become a Slyder-Hook and help build the next wave of launch-ready Slyders
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[0.97rem]">
                A Slyder-Hook is a trusted network builder who spots strong courier talent early, sends them into the SLYDE referral flow, and helps strengthen launch readiness in real towns and parishes across Jamaica.
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[0.97rem]">
                This is designed for quality introductions, not random signups. The strongest referrals move into real onboarding, activation, and first-delivery milestones before rewards unlock.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/refer-a-slyder">
                  Start as a Slyder-Hook <ArrowRight className="h-4 w-4" />
                </LinkButton>
                <LinkButton href="/refer" variant="secondary">
                  Open referral dashboard
                </LinkButton>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {referralSignals.map(({ title, description, icon: Icon }, index) => (
                <div key={title} className={`surface-card reveal-on-scroll stagger-${index + 1} p-5`}>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200/90 bg-sky-50 text-sky-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-lg font-semibold tracking-tight text-slate-950">{title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HomeWalletBanner />

      {/* â”€â”€ 4. HOW IT WORKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
           Simple 3-step process timeline. No jargon.
           Answers: "How does it actually work?"
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="how-it-works" className="mx-auto max-w-shell px-4 py-14 sm:px-6 lg:px-8">
        <div className="surface-panel reveal-on-scroll overflow-hidden p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.74fr_1.26fr] lg:items-start">
            <SectionHeading
              eyebrow="How SLYDE Works"
              title="A tighter workflow from request to confirmed delivery"
              description="Built as a clear operational sequence so merchants, Slyders, and future partners can follow the handoff from dispatch to completion."
            />
            <ProcessTimeline steps={howSlydeWorks} variant="workflow" compact />
          </div>
        </div>
      </section>

      {/* â”€â”€ 6. COVERAGE MAP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
           Where does SLYDE operate?
           Answers: "Does SLYDE cover my area?"
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <CoverageSection />

      <section className="mx-auto max-w-shell px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-[0_28px_80px_-46px_rgba(15,23,42,0.7)]">
          <Image
            src="/images/slyde-app-banner.png"
            alt="SLYDE Logistics app banner showing delivery tracking, earnings, customer updates, and merchant operations in one app"
            width={1536}
            height={1024}
            className="block h-[260px] w-full object-contain object-center sm:h-[360px] lg:h-[520px]"
            priority={false}
          />
        </div>
      </section>

      {/* â”€â”€ 9. SAFETY & RELIABILITY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
           Verification, tracking, proof of delivery.
           Answers: "How reliable and safe is this?"
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      {/* â”€â”€ 7. SOLUTIONS GRID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
           Four entry points: Slyders, Merchants, Platforms, Enterprise.
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Network Entry Points"
          title="One network, four ways to join"
          description="SLYDE is built to serve couriers, merchants, platform integrations, and enterprise operators through a single coordinated delivery infrastructure."
          align="center"
        />
        <div className="mt-10">
          <InfoCardGrid items={homeSolutions} columns="four" />
        </div>
      </section>

      {/* â”€â”€ 8. WORKFLOW MAP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
           Visual operational map for engaged visitors.
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <WorkflowMap />

      {/* â”€â”€ 12. FINAL CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
           Close the page with a clear next step.
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      {/* â”€â”€ 13. BOTTOM NAV CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
           Quick-access links for decisive visitors.
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
