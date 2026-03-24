import type { Metadata } from "next";
import { safetyPillars } from "@/content/site";
import { CTASection } from "@/components/site/cta-section";
import { HeroSection } from "@/components/site/hero-section";
import { InfoCardGrid } from "@/components/site/info-card-grid";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Safety",
  "Understand the SLYDE trust framework for Slyder verification, readiness, tracked lifecycle control, and proof of delivery.",
  "/safety",
);

export default function SafetyPage() {
  return (
    <>
      <HeroSection
        eyebrow="Safety"
        title="Trust and delivery reliability built into the workflow"
        description="SLYDE is being positioned around verification, operational readiness, tracked delivery lifecycle control, proof of delivery, and support escalation."
        actions={[
          { href: "/become-a-slyder", label: "See Slyder Process" },
          { href: "/for-businesses", label: "See Business Benefits", variant: "secondary" },
        ]}
      />
      <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
        <InfoCardGrid items={safetyPillars} columns="three" />
      </section>
      <section className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
        <div className="surface-panel p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-surface-1 p-6">
              <h2 className="text-lg font-semibold text-slate-950">Account control</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">Applicants do not receive working app access until approval is complete and activation instructions are issued.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-surface-1 p-6">
              <h2 className="text-lg font-semibold text-slate-950">Support escalation</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">The public site and partner contact flows create clear escalation routes for applicants, businesses, and future integrated operators.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-surface-1 p-6">
              <h2 className="text-lg font-semibold text-slate-950">Tracked lifecycle</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">Tracked status changes improve visibility and reduce delivery ambiguity across dispatch, pickup, transit, and completion.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-surface-1 p-6">
              <h2 className="text-lg font-semibold text-slate-950">Proof controls</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">SLYDE messaging supports PIN or QR-based proof of delivery concepts alongside final confirmation events.</p>
            </div>
          </div>
        </div>
      </section>
      <CTASection
        eyebrow="Trust Framework"
        title="Show customers and partners that delivery operations are controlled, trackable, and accountable"
        description="Safety messaging on the public site is aligned with the real review, activation, and delivery lifecycle that SLYDE is building."
        actions={[
          { href: "/contact", label: "Contact SLYDE", variant: "secondary" },
          { href: "/faq", label: "Visit FAQ", variant: "ghost" },
        ]}
      />
    </>
  );
}
