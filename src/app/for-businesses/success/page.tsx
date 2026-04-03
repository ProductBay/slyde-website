import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/link-button";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Merchant Onboarding Submitted",
  "Your merchant onboarding submission has been received by SLYDE.",
  "/for-businesses/success",
);

export default async function ForBusinessesSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const track = typeof params.track === "string" ? params.track : "merchant";
  const trackLabel = track === "grabquik" ? "GrabQuik" : "SLYDE delivery";

  return (
    <section className="section-shell py-12">
      <div className="surface-panel mx-auto max-w-3xl p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Merchant Onboarding Received</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Your {trackLabel} submission is in review.</h1>
        <p className="mt-4 text-base leading-8 text-slate-600">
          SLYDE has captured your lead and created the onboarding application. Your submission is now in the review queue for merchant fit, operating readiness, and activation planning.
        </p>

        <div className="mt-8 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-slate-950">What happens next</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            <p><span className="font-semibold text-slate-950">1. Review:</span> SLYDE operations reviews your business details, service area, and onboarding track.</p>
            <p><span className="font-semibold text-slate-950">2. Activation decision:</span> If your business is approved, SLYDE will activate your merchant workspace.</p>
            <p><span className="font-semibold text-slate-950">3. Merchant dashboard access:</span> You do <span className="font-semibold">not</span> get instant access to the merchant panel right after submission. Access is created only after approval and activation.</p>
            <p><span className="font-semibold text-slate-950">4. Follow-up:</span> Once your business is approved and activated, SLYDE will send a merchant activation email with the secure link to create your password and open the workspace.</p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-950">Important for merchants</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Submitting this form starts the onboarding and review process. It does not mean the merchant dashboard is live immediately. Merchant dashboard access is issued only after approval and activation.
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Once activation is complete, the merchant will receive the activation email, create a password securely, and then sign in through the merchant workspace to continue with dispatch, deliveries, addresses, settings, and support.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/for-businesses/status" variant="secondary">Check application status</LinkButton>
          <LinkButton href="/merchant/login" variant="secondary">Merchant login</LinkButton>
          <LinkButton href="/for-businesses">Back to business entry</LinkButton>
          <LinkButton href="/contact" variant="secondary">Contact SLYDE</LinkButton>
        </div>
      </div>
    </section>
  );
}
