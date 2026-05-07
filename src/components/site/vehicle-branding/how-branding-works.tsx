import { SectionHeading } from "@/components/site/section-heading";

const steps = [
  "Submit your branding interest",
  "Our team contacts you on WhatsApp",
  "We confirm your Slyder status and vehicle type",
  "You choose the suitable branding option",
  "Installation details are arranged with the team",
];

export function HowBrandingWorks() {
  return (
    <section className="section-shell py-14">
      <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <SectionHeading
          eyebrow="How it works"
          title="A light first step before any operational details"
          description="No payment details, documents, registration, or install scheduling are collected here. The team will guide the next step on WhatsApp."
        />
        <div className="surface-panel p-6 sm:p-8">
          <div className="grid gap-3">
            {steps.map((step, index) => (
              <div key={step} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
            Branding interest does not guarantee approval. SLYDE branding is intended for approved or eligible Slyders in good standing. Pricing, availability, and installation options may vary by vehicle type and location.
          </div>
        </div>
      </div>
    </section>
  );
}
