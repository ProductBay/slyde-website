import type { Metadata } from "next";
import { HeroSection } from "@/components/site/hero-section";
import { InquiryForm } from "@/components/site/inquiry-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Contact",
  "Contact SLYDE for support, Slyder help, business partnerships, or API and integration discussions.",
  "/contact",
);

export default function ContactPage() {
  return (
    <>
      <HeroSection
        eyebrow="Contact"
        title="Reach SLYDE for support, partnerships, and onboarding questions"
        description="Use this route for general support, Slyder help, business partnership discussions, and API or integration conversations."
        actions={[
          { href: "#contact-form", label: "Send a Message" },
          { href: "/for-businesses", label: "Business Inquiry", variant: "secondary" },
        ]}
      />
      <section className="mx-auto max-w-shell px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="surface-panel p-8">
            <h2 className="text-2xl font-semibold text-slate-950">Contact paths</h2>
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl border border-slate-200 bg-surface-1 p-5">
                <h3 className="text-lg font-semibold text-slate-950">Slyder help</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">Application status, onboarding questions, activation guidance, and readiness follow-up.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-surface-1 p-5">
                <h3 className="text-lg font-semibold text-slate-950">Business route</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">Merchant and enterprise partnership discussions, service coverage requests, and delivery operations planning.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-surface-1 p-5">
                <h3 className="text-lg font-semibold text-slate-950">Partner/API route</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">API access, delivery orchestration discussions, and integration workflow planning.</p>
              </div>
              <div className="rounded-3xl border border-slate-950 bg-slate-950 p-5 text-white">
                <h3 className="text-lg font-semibold">WhatsApp placeholder</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">+1 (876) 000-0000</p>
              </div>
            </div>
          </div>
          <div id="contact-form">
            <InquiryForm
              mode="contact"
              title="Send a message"
              description="Use this form for support or general contact. Business and API teams can also route here if they need a direct response."
              submitLabel="Send message"
              successHref="/success/contact"
            />
          </div>
        </div>
      </section>
    </>
  );
}
