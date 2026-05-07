import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";

const reasons = [
  "Look more professional on the road",
  "Build trust with merchants and customers",
  "Help people identify you as part of the SLYDE network",
  "Strengthen your earning presence",
  "Support Jamaica's growing delivery infrastructure",
];

export function BrandingTrustSection() {
  return (
    <section className="section-shell py-14">
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <SectionHeading
          eyebrow="Why brand with SLYDE?"
          title="A more trusted presence before the handoff"
          description="Professional branding helps customers and merchants recognize that you are connected to the SLYDE delivery network."
        />
        <div className="surface-panel p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            {reasons.map((reason) => (
              <div key={reason} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-sm leading-6 text-slate-700">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
