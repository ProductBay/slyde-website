import type { Metadata } from "next";
import { CTASection } from "@/components/site/cta-section";
import { ContentSection } from "@/components/site/content-section";
import { FundedErrandsExplainer } from "@/components/site/funded-errands-explainer";
import { LynkBenefitsGrid } from "@/components/site/lynk-benefits-grid";
import { PaymentFaqGroup } from "@/components/site/payment-faq-group";
import { SlyderPayoutsHero } from "@/components/site/slyder-payouts-hero";
import { TrustPillarsRow } from "@/components/site/trust-pillars-row";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Slyder Payouts",
  "Learn how SLYDE is building smarter Slyder payouts, Lynk-aware digital support, and safer funded errand workflows.",
  "/slyder-payouts",
);

export default function SlyderPayoutsPage() {
  return (
    <>
      <SlyderPayoutsHero
        eyebrow="Slyder payments"
        title="Slyder payouts, built for the road ahead"
        description="SLYDE is building a smarter payout and payment-support model for delivery partners in Jamaica. Our goal is to help Slyders operate with stronger earnings visibility, less cash-related friction, and better preparation for future-ready delivery and errand workflows. As the network grows, supported payout options and digital payment rails can help make Slyder operations more professional, more secure, and easier to manage."
        primaryCta={{ label: "Become a Slyder", href: "/become-a-slyder" }}
        secondaryCta={{ label: "View Slyder application", href: "/become-a-slyder/apply" }}
      />

      <TrustPillarsRow
        sectionId="slyder-payouts-trust-row"
        items={[
          { id: "earnings-visibility", label: "Stronger earnings visibility" },
          { id: "supported-digital-rails", label: "Supported digital rails" },
          { id: "safer-funded-errands", label: "Safer funded errands" },
          { id: "professional-operations", label: "Professional operating systems" },
        ]}
      />

      <ContentSection
        sectionId="slyder-payouts-how-it-works"
        eyebrow="How payouts work"
        title="How Slyder payouts work"
      >
        <p className="text-sm leading-7 text-slate-600">
          When Slyders complete eligible work through SLYDE, earnings are tracked within the platform and tied to the Slyder&apos;s account setup. Supported payout methods are configured during onboarding and may be reviewed based on platform policy and operational readiness.
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          The aim is simple: give Slyders a clear path to understanding earnings, payout setup, and payout status without unnecessary confusion.
        </p>
      </ContentSection>

      <LynkBenefitsGrid
        sectionId="slyder-payouts-why-digital-support"
        title="Why digital payout support matters"
        description="Digital payout support can help Slyders work more confidently by improving the way earnings are managed and reducing reliance on cash-heavy routines. Supported digital rails, including Lynk-ready workflows where available, can help provide:"
        items={[
          {
            id: "payout-setup-verification",
            title: "Clearer payout setup and verification",
            body: "Supported digital payout flows can make it easier to understand how payout details are configured and reviewed.",
          },
          {
            id: "better-withdrawal-visibility",
            title: "Better earnings and withdrawal visibility",
            body: "Slyders benefit from clearer understanding of what has been earned, what is pending, and how payout status is progressing.",
          },
          {
            id: "less-cash-handling",
            title: "Less dependence on cash handling",
            body: "Cleaner payout flows can reduce the pressure of cash-heavy routines and support more professional day-to-day operations.",
          },
          {
            id: "future-errand-support",
            title: "Stronger support for future errand workflows",
            body: "More advanced errands may require better payment structure, proof, and accountability. Digital support helps prepare for that.",
          },
          {
            id: "professional-operating-experience",
            title: "A more professional operating experience",
            body: "Better payout infrastructure helps Slyders operate inside a more trusted and organized network.",
          },
        ]}
      />

      <ContentSection sectionId="slyder-payouts-why-lynk" eyebrow="Supported rails" title="Why supported rails like Lynk can matter">
        <p className="text-sm leading-7 text-slate-600">
          As SLYDE expands its payout and payment support model, approved digital rails such as Lynk can help strengthen the operating experience for eligible Slyders.
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          This can be useful for smoother payout routing, improved payout readiness, digital-first account support, future payment-enabled errand workflows, and stronger trust and accountability across the network.
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          Availability, eligibility, and setup requirements may vary by rollout stage and operational policy.
        </p>
      </ContentSection>

      <FundedErrandsExplainer
        sectionId="slyder-payouts-funded-errands"
        title="Preparing for safer funded errands"
        description="Some errands go beyond pickup and dropoff. They may involve in-person purchases, bill payments, or other tasks that require controlled payment handling. SLYDE is designing structured errand systems to support these job types more safely. That includes stronger proof requirements, clearer records, and support for trusted payment workflows where appropriate. The long-term goal is to help Slyders complete more advanced errands without unnecessary confusion, risk, or payment disputes."
        points={[
          {
            id: "stronger-proof",
            title: "Stronger proof requirements",
            body: "Better records help protect customers, Slyders, and the platform.",
          },
          {
            id: "clearer-records",
            title: "Clearer payment and completion records",
            body: "Structured steps help reduce disputes around what was paid, what was purchased, and what was delivered.",
          },
          {
            id: "safer-task-expansion",
            title: "Safer expansion into advanced tasks",
            body: "SLYDE can responsibly support more complex errands when payment and proof systems are clearly structured.",
          },
        ]}
      />

      <ContentSection sectionId="slyder-payouts-what-this-means" eyebrow="Why this matters" title="What this means for Slyders">
        <p className="text-sm leading-7 text-slate-600">
          It means SLYDE is not just building another courier signup page. We are building an operating system designed to help Slyders grow into a more trusted, more capable, and more future-ready role within the platform.
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          That includes better readiness standards, clearer account setup, stronger payout visibility, safer errand support, and more structured delivery operations.
        </p>
      </ContentSection>

      <PaymentFaqGroup
        sectionId="slyder-payouts-mini-faq"
        title="Common questions"
        items={[
          {
            id: "payouts-mini-faq-need-lynk-before-apply",
            question: "Do I need a Lynk account before applying?",
            answer: "No. You can apply first. Supported payout setup details are typically handled during onboarding.",
          },
          {
            id: "payouts-mini-faq-only-method",
            question: "Will Lynk be the only payout method?",
            answer: "Not necessarily. SLYDE is designed to support operationally approved payout methods based on platform policy and rollout stage.",
          },
          {
            id: "payouts-mini-faq-help-errands",
            question: "Will digital payments help with errands?",
            answer: "Yes, supported digital workflows can help create safer and more structured errand operations where payment handling is involved.",
          },
        ]}
      />

      <CTASection
        eyebrow="Join a smarter network"
        title="Join a network built for smarter delivery operations"
        description="SLYDE is building a more professional delivery and errands network for Jamaica — one that gives Slyders clearer systems, stronger support, and a better path forward."
        actions={[
          { href: "/become-a-slyder", label: "Become a Slyder", variant: "primary" },
          { href: "/contact", label: "Contact us", variant: "secondary" },
        ]}
      />
    </>
  );
}
