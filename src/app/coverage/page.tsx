import type { Metadata } from "next";
import { CoverageSection } from "@/components/site/coverage-section";
import { HeroSection } from "@/components/site/hero-section";
import { ParishHotspotBoard } from "@/components/site/parish-hotspot-board";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Coverage",
  "Explore current SLYDE service focus areas, rollout zones, and the Jamaica-first expansion model.",
  "/coverage",
);

export default function CoveragePage() {
  return (
    <>
      <HeroSection
        eyebrow="Coverage"
        title="Coverage built around practical rollout and operational control"
        description="SLYDE is being launched with a Jamaica-first network strategy that prioritizes dense demand zones, controlled service quality, and future regional repeatability."
        actions={[
          { href: "/for-businesses", label: "Discuss Business Coverage" },
          { href: "/become-a-slyder", label: "View Slyder Opportunities", variant: "secondary" },
        ]}
      />
      <CoverageSection />
      <ParishHotspotBoard />
      <section className="mx-auto max-w-shell px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="surface-card p-6">
            <h2 className="text-lg font-semibold text-slate-950">Current service areas</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">The launch focus is on the Kingston metropolitan area and adjacent demand corridors.</p>
          </div>
          <div className="surface-card p-6">
            <h2 className="text-lg font-semibold text-slate-950">Rollout zones</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Additional urban zones are evaluated based on merchant demand, courier density, and operational readiness.</p>
          </div>
          <div className="surface-card p-6">
            <h2 className="text-lg font-semibold text-slate-950">Business availability</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Coverage for businesses can differ by use case, service level, and operational partnership model.</p>
          </div>
        </div>
      </section>
    </>
  );
}
