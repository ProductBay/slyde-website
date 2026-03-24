import type { Metadata } from "next";
import { CTASection } from "@/components/site/cta-section";
import { HeroSection } from "@/components/site/hero-section";
import { InfoCardGrid } from "@/components/site/info-card-grid";
import { InquiryForm } from "@/components/site/inquiry-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "API Integrations",
  "Position SLYDE as an API-ready logistics orchestration platform for merchants, marketplaces, and enterprise partners.",
  "/api-integrations",
);

const capabilities = [
  { eyebrow: "Create delivery", title: "Generate jobs from your own workflow", description: "Use SLYDE as the orchestration layer behind checkout, support, or internal operations." },
  { eyebrow: "Request quote", title: "Estimate logistics costs in advance", description: "Support pricing, checkout logic, and operational planning." },
  { eyebrow: "Assign courier", title: "Route jobs into a managed courier network", description: "Push delivery requests into SLYDE dispatch and status workflows." },
  { eyebrow: "Track status", title: "Receive live lifecycle visibility", description: "Follow each job from creation to delivery confirmation." },
  { eyebrow: "Delivery events", title: "Expose milestone-driven delivery data", description: "Use status events for merchant, operator, and customer communications." },
  { eyebrow: "Proof of delivery", title: "Capture final confirmation records", description: "Align with QR, PIN, and delivery verification controls." },
];

export default function ApiIntegrationsPage() {
  return (
    <>
      <HeroSection
        eyebrow="API / Integrations"
        title="Logistics API positioning for merchants, platforms, and enterprise operators"
        description="SLYDE is being positioned as more than a courier marketplace. It is a logistics orchestration layer built to support delivery creation, tracking, proof of delivery, and event-driven workflows."
        actions={[
          { href: "#api-form", label: "Request API Access" },
          { href: "/for-businesses", label: "Talk to Partnerships", variant: "secondary" },
        ]}
        aside={
          <div className="dark-panel p-6 sm:p-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-200">Platform posture</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Infrastructure layer for delivery orchestration</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {["Delivery creation endpoints", "Live status and event architecture", "Courier assignment workflows", "Proof-of-delivery support"].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        }
      />

      <section className="section-shell py-16">
        <InfoCardGrid items={capabilities} columns="three" />
      </section>

      <section className="section-shell py-8">
        <div className="dark-panel p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow-badge border-white/10 bg-white/5 text-sky-200">Who Should Integrate</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">Built for platforms that need logistics as infrastructure</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                The integration posture is enterprise-minded: secure request flows, controlled courier assignment, proof-of-delivery support, and event architecture that can plug into internal systems later.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {["Commerce platforms", "Merchants", "Food delivery operations", "Pharmacy delivery", "Errand services", "Enterprise fulfillment teams"].map((label) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm font-medium text-slate-100">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-8">
        <div className="surface-panel p-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              "1. Delivery request enters SLYDE from your platform or operator workflow.",
              "2. SLYDE handles dispatch orchestration, courier progression, and status movement.",
              "3. Delivery events and proof data return to your system for operational visibility.",
            ].map((line) => (
              <div key={line} className="rounded-3xl border border-slate-200 bg-surface-1 p-5 text-sm leading-7 text-slate-700">
                {line}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="api-form" className="section-shell py-8">
        <InquiryForm
          mode="api"
          title="Request API access"
          description="Tell us about your platform, projected delivery volume, and the delivery events or orchestration capabilities you need."
          submitLabel="Request access"
          successHref="/success/api-request"
        />
      </section>

      <CTASection
        eyebrow="Integration Readiness"
        title="Bring SLYDE into your commerce and fulfillment stack"
        description="Use SLYDE for direct operational partnerships now and move toward deeper API-driven delivery orchestration as your business grows."
        actions={[
          { href: "/contact", label: "Contact Integration Team", variant: "secondary" },
          { href: "/faq", label: "Read Integration FAQ", variant: "ghost" },
        ]}
      />
    </>
  );
}
