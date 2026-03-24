import type { Metadata } from "next";
import { lifecycleTimeline, primaryCtas, slyderTypes, zoneStatusMessages } from "@/content/site";
import { CTASection } from "@/components/site/cta-section";
import { HeroSection } from "@/components/site/hero-section";
import { InfoCardGrid } from "@/components/site/info-card-grid";
import { LinkButton } from "@/components/ui/link-button";
import { LynkBenefitsGrid } from "@/components/site/lynk-benefits-grid";
import { PaymentInfoCard } from "@/components/site/payment-info-card";
import { ProcessTimeline } from "@/components/site/process-timeline";
import { SectionHeading } from "@/components/site/section-heading";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Become a Slyder",
  "Join the SLYDE delivery network through a structured recruitment and approval flow.",
  "/become-a-slyder",
);

const benefits = [
  {
    eyebrow: "Founding network",
    title: "Be part of the founding SLYDE network",
    description: "Join early and become part of the first wave helping to build delivery strength in your area.",
  },
  {
    eyebrow: "Launch position",
    title: "Get positioned in your zone before launch",
    description: "Early approved Slyders are best positioned as their area approaches launch readiness.",
  },
  {
    eyebrow: "First-wave advantage",
    title: "Prepare early for delivery opportunities",
    description: "Learn the platform, complete onboarding, and stay ready as your area moves closer to going live.",
  },
  {
    eyebrow: "Long-term growth",
    title: "Grow with a company built for Jamaica and the Caribbean",
    description: "SLYDE is designed to launch region by region with standards that support future Caribbean scale.",
  },
];

const requirements = [
  { title: "Valid identification", description: "A government-issued ID is required to support identity review." },
  { title: "A working smartphone", description: "You need a reliable smartphone for app access, tracking, and operational communication." },
  { title: "Reliable internet or mobile data access", description: "You must be able to stay connected during onboarding and when your area launches." },
  { title: "WhatsApp access for updates", description: "SLYDE uses WhatsApp and email to confirm applications and share onboarding updates." },
  { title: "Vehicle details and documents where required", description: "Motorcycle, car, and van applicants must submit the necessary supporting records." },
  { title: "Availability for launch readiness", description: "You should be ready to complete onboarding and deliver when your area goes live." },
];

const startSteps = [
  "Apply online",
  "Get reviewed and approved",
  "Receive access to the SLYDE app",
  "Complete your setup and readiness steps",
  "Begin working as your area launches",
];

const postApplyItems = [
  "A WhatsApp confirmation message",
  "A confirmation email with your application details",
  "Updates if our team needs more information",
  "Follow-up guidance if you are approved for onboarding",
];

export default function BecomeASlyderPage() {
  return (
    <>
      <HeroSection
        eyebrow="Become a Slyder"
        title="Become a Slyder"
        description="Join Jamaica's next delivery network and be part of the first wave powering a new era of logistics."
        supportText="Flexible opportunity. Structured platform. Built for growth."
        actions={[
          { href: "/become-a-slyder/apply", label: "Apply Now" },
          { href: "/faq", label: "Read Slyder FAQ", variant: "secondary" },
        ]}
        aside={
          <div className="dark-panel p-6 sm:p-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-200">Founding network</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Join early and prepare for launch in your area</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                "SLYDE launches region by region, not all at once.",
                "Early approved Slyders are best positioned as launch approaches.",
                "After you apply, SLYDE sends a WhatsApp confirmation and email.",
                "Approval leads to app access, setup, and readiness before work eligibility.",
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
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <SectionHeading
            eyebrow="What Is A Slyder"
            title="A Slyder is an independent delivery partner on the SLYDE network"
            description="You choose when you work, where you operate, and how you prepare for launch using a platform designed for efficiency, safety, accountability, and long-term opportunity."
          />
          <div className="surface-panel p-8">
            <p className="text-base leading-8 text-slate-600">
              As SLYDE grows region by region, early Slyders will be among the first positioned in their area when operations begin.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell py-16">
        <SectionHeading
          eyebrow="Why Join Early"
          title="Joining early gives you an advantage"
          description="You are not just signing up for another delivery platform. You are becoming part of the founding SLYDE network in your area."
        />
        <div className="mt-10">
          <InfoCardGrid items={benefits} columns="four" />
        </div>
        <p className="mt-6 text-sm leading-7 text-slate-500">Early approved Slyders are best positioned as their zone approaches launch.</p>
      </section>

      <LynkBenefitsGrid
        sectionId="become-slyder-digital-payouts"
        title="Why digital payout support matters"
        description="Being a Slyder is more than completing deliveries. It is about operating efficiently, receiving earnings with confidence, and being prepared for more advanced job types as the network grows. SLYDE is building a payout experience that supports stronger earnings visibility, smoother withdrawal setup, and safer operational workflows. Supported digital payout rails, including Lynk-ready workflows, help position Slyders for a more modern way to work."
        items={[
          {
            id: "less-cash-dependence",
            title: "Less dependence on cash",
            body: "Digital payout support helps reduce the pressure of cash-heavy operations and gives Slyders a cleaner way to manage earnings and payment activity.",
          },
          {
            id: "better-payout-visibility",
            title: "Better payout visibility",
            body: "Slyders should know when earnings are available, when payouts are pending, and how their payout method is configured.",
          },
          {
            id: "future-ready-funded-errands",
            title: "Future-ready for funded errands",
            body: "Some errands may require approved in-person payments. Structured payment support can help Slyders handle these tasks more safely and with better accountability.",
          },
          {
            id: "professional-operations",
            title: "Built for professional operations",
            body: "From onboarding to readiness, SLYDE is designed to help Slyders work inside a more trusted and organized system.",
          },
        ]}
      />

      <section className="section-shell pt-0">
        <div className="surface-card p-6 text-sm leading-7 text-slate-600">
          As SLYDE expands, supported payout options may include bank-based methods, mobile-friendly methods, and approved digital rails such as Lynk where operationally available. Setup details and eligibility are handled during onboarding and platform review.
        </div>
      </section>

      <section className="section-shell py-16">
        <SectionHeading eyebrow="Who Can Apply" title="Multiple courier types can join the network" description="SLYDE is designed to support different delivery capacity types across Jamaica." />
        <div className="mt-10">
          <InfoCardGrid items={slyderTypes} columns="four" />
        </div>
      </section>

      <section className="section-shell py-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="When Can You Start Working"
            title="Your start time depends on your area's readiness"
            description="SLYDE launches by region, not all at once. We activate each area only when there are enough approved and ready Slyders to support reliable delivery operations."
          />
          <div className="surface-panel p-8">
            <p className="text-sm leading-7 text-slate-600">
              That means your start time depends on your area's readiness, not just your application date. However, joining early puts you in the best position when your zone goes live.
            </p>
            <div className="mt-6 grid gap-3">
              {startSteps.map((step, index) => (
                <div key={step} className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-surface-1 px-4 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">{index + 1}</span>
                  <p className="text-sm leading-7 text-slate-600">{step}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-7 text-slate-500">
              This approach helps SLYDE launch with stronger coverage, better reliability, and better support for both Slyders and businesses.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell py-16">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <SectionHeading
            eyebrow="Your Area Matters"
            title="SLYDE tracks network strength by town and parish"
            description="Once your area reaches the required number of approved and ready Slyders, we move closer to launch in that zone. This helps us build a stronger, more dependable delivery network from day one."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {Object.values(zoneStatusMessages).map((message) => (
              <div key={message.headline} className="surface-card p-6">
                <h3 className="text-lg font-semibold text-slate-950">{message.headline}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{message.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="How Onboarding Works"
            title="Clear steps from application to launch readiness"
            description="We've designed onboarding to be clear, structured, and easy to follow."
          />
          <ProcessTimeline steps={lifecycleTimeline} />
        </div>
      </section>

      <section className="section-shell py-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionHeading
            eyebrow="What Happens After You Apply"
            title="Real confirmation and structured follow-up"
            description="Once you submit your application, SLYDE will confirm that we received it."
          />
          <div className="surface-panel p-8">
            <div className="grid gap-3">
              {postApplyItems.map((item) => (
                <div key={item} className="rounded-3xl border border-slate-200 bg-surface-1 px-4 py-4 text-sm leading-7 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-7 text-slate-600">
              We want every applicant to know their submission is real, received, and being handled through a structured review process.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Your confirmation message may also include area-specific launch information based on your town or parish.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell py-16">
        <SectionHeading
          eyebrow="Basic Requirements"
          title="Most applicants should be ready with the following"
          description="Requirements may vary depending on your vehicle type and area, but most applicants should be ready with these core items."
        />
        <div className="mt-10">
          <InfoCardGrid items={requirements} columns="three" />
        </div>
      </section>

      <section className="section-shell py-10">
        <div className="surface-panel p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Future Opportunity</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.35rem]">
                Approved Slyders will later be able to help grow their parish through Area Builder Rewards
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                SLYDE is preparing a future program where approved Slyders can help bring quality couriers into their area and unlock commission-free reward windows through the SLYDE app.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <a
                href="/grow-your-area"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-glow transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Learn about Area Builder Rewards
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-10">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <SectionHeading
            eyebrow="Setup reassurance"
            title="You do not need every setup detail before applying"
            description="The application process is focused on helping us understand your fit, availability, and readiness. Full payout setup guidance and supported payment options are introduced during onboarding."
          />
          <div className="space-y-5">
            <PaymentInfoCard
              sectionId="become-slyder-setup-reassurance"
              title="You do not need every setup detail before applying"
              body="The application process is focused on helping us understand your fit, availability, and readiness. Full payout setup guidance and supported payment options are introduced during onboarding."
            />
            <div>
              <LinkButton href="/become-a-slyder/apply">Start your application</LinkButton>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Join The SLYDE Network"
        title="Join the SLYDE network today"
        description="Be part of the next generation of delivery in Jamaica. Apply early, secure your place in your area, and stay ready as SLYDE launches region by region."
        actions={[primaryCtas[0]]}
      />
    </>
  );
}
