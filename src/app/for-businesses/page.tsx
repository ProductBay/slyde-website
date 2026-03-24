import type { Metadata } from "next";
import { CTASection } from "@/components/site/cta-section";
import { FundedErrandsExplainer } from "@/components/site/funded-errands-explainer";
import { HeroSection } from "@/components/site/hero-section";
import { InfoCardGrid } from "@/components/site/info-card-grid";
import { InquiryForm } from "@/components/site/inquiry-form";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "For Businesses",
  "Use SLYDE as a Jamaica-first fulfillment and courier network for merchants, retailers, restaurants, pharmacies, and enterprise teams.",
  "/for-businesses",
);

const cards = [
  {
    eyebrow: "Same-day support",
    title: "On-demand and same-day delivery operations",
    description: "Use SLYDE for urgent local dispatch, customer deliveries, and managed fulfillment workflows.",
  },
  {
    eyebrow: "Tracked service",
    title: "Live delivery visibility and proof of delivery",
    description: "Customers and operators get greater confidence through status updates, milestone tracking, and delivery confirmation.",
  },
  {
    eyebrow: "No internal fleet required",
    title: "A scalable delivery layer without fleet build-out",
    description: "SLYDE reduces the burden of managing your own courier hiring, routing, and dispatch stack.",
  },
  {
    eyebrow: "Integration flexibility",
    title: "Ready for manual operations now and deeper integrations later",
    description: "Start with direct partnership workflows and move into API-connected order orchestration as needed.",
  },
];

export default function ForBusinessesPage() {
  return (
    <>
      <HeroSection
        eyebrow="For Businesses"
        title="A merchant-ready delivery network without the cost of building your own fleet"
        description="SLYDE is built for retailers, restaurants, pharmacies, marketplaces, and enterprise teams that need reliable delivery support, customer confidence, and a scalable logistics partner."
        actions={[
          { href: "#business-form", label: "Start Partnership Inquiry" },
          { href: "/api-integrations", label: "View API Positioning", variant: "secondary" },
        ]}
      />

      <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
        <InfoCardGrid items={cards} columns="four" />
      </section>

      <section id="business-form" className="mx-auto max-w-shell px-4 py-8 sm:px-6 lg:px-8">
        <InquiryForm
          mode="business"
          title="Partnership inquiry"
          description="Tell SLYDE what type of operation you run, where you need delivery coverage, and how your delivery volume behaves. Merchant inquiries are reviewed against zone readiness, courier network strength, and launch control."
          submitLabel="Submit inquiry"
          successHref="/success/business-inquiry"
        />
        <p className="mt-4 text-sm leading-7 text-slate-500">
          By submitting this form, your business will also acknowledge the{" "}
          <Link href="/legal/merchant-onboarding-terms" className="font-semibold text-sky-700 underline underline-offset-4">
            Merchant Interest and Onboarding Terms
          </Link>{" "}
          and the{" "}
          <Link href="/legal/merchant-privacy" className="font-semibold text-sky-700 underline underline-offset-4">
            Merchant Privacy Notice
          </Link>
          .
        </p>
      </section>

      <FundedErrandsExplainer
        sectionId="for-businesses-payment-enabled-errands"
        title="Safer, more structured errand workflows for real-world tasks"
        description="Not every task ends at delivery. Some business and customer requests require in-person purchases, payments, or task completion steps that need stronger operational control. SLYDE is building structured errand workflows with clearer proof requirements, stronger completion records, and support for digital payment-enabled operations where appropriate. This helps reduce confusion around reimbursements, payment handling, and task verification."
        points={[
          {
            id: "proof-accountability",
            title: "Better proof and accountability",
            body: "Receipt-backed and confirmation-backed workflows help create clearer records for sensitive errand jobs.",
          },
          {
            id: "reduced-payment-ambiguity",
            title: "Reduced payment ambiguity",
            body: "Structured operational rules can help reduce misunderstandings around what was paid, what was purchased, and what was completed.",
          },
          {
            id: "modern-commerce-support",
            title: "Designed for modern commerce support",
            body: "As SLYDE evolves, supported digital rails can strengthen the way errands, pickups, and in-person completion tasks are handled within the network.",
          },
        ]}
        cta={{ label: "Talk to SLYDE for your business", href: "/contact" }}
      />

      <section className="section-shell pt-0">
        <div className="surface-card p-6 text-sm leading-7 text-slate-600">
          For businesses, this means more confidence in how errands are executed. For customers, it means stronger visibility. For Slyders, it means clearer systems and safer workflows.
        </div>
      </section>

      <CTASection
        eyebrow="Business Growth"
        title="Move from manual delivery coordination to a structured logistics partner"
        description="SLYDE is positioned to help businesses improve fulfillment performance now while preparing for future operational integrations."
        actions={[
          { href: "/contact", label: "Contact SLYDE", variant: "secondary" },
          { href: "/coverage", label: "Review Coverage", variant: "ghost" },
        ]}
      />
    </>
  );
}
