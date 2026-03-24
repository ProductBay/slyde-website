import type { Metadata } from "next";
import { CTASection } from "@/components/site/cta-section";
import { HeroSection } from "@/components/site/hero-section";
import { InfoCardGrid } from "@/components/site/info-card-grid";
import { SectionHeading } from "@/components/site/section-heading";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "About SLYDE",
  "Learn why SLYDE was built as a logistics network for Jamaica first and future Caribbean commerce.",
  "/about",
);

const storyCards = [
  {
    eyebrow: "Mission",
    title: "Make logistics simpler to access and easier to trust",
    description: "SLYDE exists to give merchants, platforms, and delivery workers a better operating layer for modern local commerce.",
  },
  {
    eyebrow: "Problem",
    title: "Jamaican and Caribbean delivery operations are often fragmented",
    description: "Manual dispatch, weak visibility, inconsistent courier readiness, and limited integration options all slow down commerce.",
  },
  {
    eyebrow: "Solution",
    title: "A modern dispatch and fulfillment network",
    description: "SLYDE brings courier onboarding, delivery control, proof-of-delivery workflows, and partner readiness into one coordinated platform.",
  },
];

export default function AboutPage() {
  return (
    <>
      <HeroSection
        eyebrow="About SLYDE"
        title="Built to become logistics infrastructure for Jamaica and the wider Caribbean"
        description="SLYDE was built to address a deeper logistics problem: too many growing businesses need reliable delivery operations but do not have the tools, courier structure, or integration layer to run them well."
        actions={[
          { href: "/for-businesses", label: "Partner with SLYDE" },
          { href: "/become-a-slyder", label: "Become a Slyder", variant: "secondary" },
        ]}
      />

      <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
        <InfoCardGrid items={storyCards} columns="three" />
      </section>

      <section className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
        <div className="surface-panel p-8 sm:p-10">
          <SectionHeading
            eyebrow="Why SLYDE Was Built"
            title="Because logistics should not be the bottleneck to growth"
            description="Restaurants, retailers, pharmacies, marketplaces, and service operators increasingly depend on delivery. Yet building a fleet, creating dispatch workflows, and maintaining customer visibility is expensive and operationally complex. SLYDE addresses that with a structured network model."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-surface-1 p-6">
              <h3 className="text-lg font-semibold text-slate-950">Infrastructure, not just interface</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">The long-term vision is to support public ordering flows, business dispatch operations, and API-connected delivery orchestration from the same logistics foundation.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-surface-1 p-6">
              <h3 className="text-lg font-semibold text-slate-950">Network effects over isolated operations</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Every approved Slyder, integrated partner, and expanded coverage zone strengthens the delivery network and makes the platform more useful.</p>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Long-Term Vision"
        title="A courier and fulfillment network that can scale beyond one city or one use case"
        description="SLYDE is being shaped for Jamaica first, with repeatable operational standards that can support merchants, platforms, and courier partners across the Caribbean over time."
        actions={[
          { href: "/coverage", label: "Explore Coverage", variant: "primary" },
          { href: "/api-integrations", label: "View API Positioning", variant: "secondary" },
        ]}
      />
    </>
  );
}
