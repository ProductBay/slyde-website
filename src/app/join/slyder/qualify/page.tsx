import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/metadata";
import { SlyderQualificationForm } from "@/components/site/join/slyder-qualification-form";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = buildMetadata(
  "Quick Readiness Check — SLYDE",
  "Answer a few quick questions so our team can guide your Slyder activation properly.",
  "/join/slyder/qualify",
);

const TRUST_BULLETS = [
  "No documents required at this step",
  "WhatsApp-first updates",
  "Founding Slyder priority",
  "Full application comes after",
];

export default function JoinSlyderQualifyPage() {
  return (
    <section className="section-shell py-12 sm:py-16">
      <div className="mx-auto max-w-content">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          {/* Left: copy */}
          <div className="space-y-6 lg:sticky lg:top-28">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">
                Almost There
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-[2.8rem]">
                Let&apos;s Match You to the Right SLYDE Opportunity
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Answer a few quick questions so our team can guide your activation properly.
              </p>
            </div>

            <div className="surface-panel p-5">
              <p className="text-sm font-semibold text-slate-800 mb-3">Still no heavy details needed</p>
              <div className="space-y-2.5">
                {TRUST_BULLETS.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950 p-5">
              <p className="text-sm font-semibold text-white">What happens next</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                After this step you&apos;ll be guided to your full SLYDE application. Our team uses these answers to match you to the right zone and opportunity when your area launches.
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="surface-card p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-950 mb-6">Quick readiness check</h2>
            <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
              <SlyderQualificationForm />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
