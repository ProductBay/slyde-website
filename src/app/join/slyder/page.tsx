import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { SlyderLeadForm } from "@/components/site/join/slyder-lead-form";
import { FoundingSlyderCounter } from "@/components/site/join/founding-slyder-counter";
import { TrustStrip } from "@/components/site/join/trust-strip";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = buildMetadata(
  "Reserve Your Founding Slyder Spot",
  "Join Jamaica's structured delivery network before public launch. Reserve your spot with your basic details — no documents required at this step.",
  "/join/slyder",
);

const TRUST_BULLETS = [
  "No documents required at this step",
  "WhatsApp-first updates",
  "Founding Slyder priority",
  "Full application comes after",
];

export default async function JoinSlyderPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const referredByCode = params?.ref;

  return (
    <section className="section-shell py-12 sm:py-16">
      <div className="mx-auto max-w-content">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {/* Left: copy + trust */}
          <div className="space-y-6 lg:sticky lg:top-28">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">
                Founding Slyder
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-[2.8rem]">
                Reserve Your Founding Slyder Spot
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Join Jamaica&apos;s structured delivery network before public launch. Start with your basic details — full onboarding comes after.
              </p>
            </div>

            <FoundingSlyderCounter />

            <div className="surface-panel p-5">
              <p className="text-sm font-semibold text-slate-800 mb-3">What to expect</p>
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
              <p className="text-sm font-semibold text-white">Independent courier opportunity</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                A Slyder works independently, not on a fixed shift. You choose your zone, set your availability, and receive dispatches from the full SLYDE network — businesses, platforms, and residential customers.
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="surface-card p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-950 mb-6">Your details</h2>
            <SlyderLeadForm referredByCode={referredByCode} />
          </div>
        </div>

        <div className="mt-12 rounded-[1.75rem] border border-slate-200 bg-white py-5 px-6">
          <TrustStrip />
        </div>
      </div>
    </section>
  );
}
