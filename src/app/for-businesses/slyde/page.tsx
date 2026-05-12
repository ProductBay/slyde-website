import type { Metadata } from "next";
import { BusinessModelOverview } from "@/components/site/for-businesses/business-model-overview";
import { LinkButton } from "@/components/ui/link-button";
import { buildMetadata } from "@/lib/metadata";

function resolveVariant(value: string | string[] | undefined): "a" | "b" {
  if (Array.isArray(value)) {
    return value[0] === "b" ? "b" : "a";
  }
  return value === "b" ? "b" : "a";
}

export const metadata: Metadata = buildMetadata(
  "Use SLYDE for Delivery",
  "Use SLYDE delivery onboarding to scale from social-selling workflows to structured business operations with clear tier boundaries.",
  "/for-businesses/slyde",
);

export default async function SlydeDeliveryOverviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ ab?: string | string[] }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const variant = resolveVariant(resolvedSearchParams?.ab);

  const headline =
    variant === "b"
      ? "Move from social-order chaos to controlled delivery execution."
      : "Structured delivery growth for social sellers and business operators.";
  const primaryCta = variant === "b" ? "Start 60-Day Trial" : "Start SLYDE Delivery Onboarding";
  const secondaryCta = variant === "b" ? "See GrabQuik Growth Path" : "See GrabQuik Option";

  return (
    <>
      <section className="section-shell py-10 sm:py-12">
        <div className="surface-panel p-6 sm:p-10" data-copy-variant={variant}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">SLYDE Delivery Track</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{headline}</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
            Keep your customer channels while SLYDE runs dependable delivery operations. This pathway is built for Instagram and
            WhatsApp sellers who need consistency, and for larger teams who need stronger routing, support, and integration capacity.
          </p>
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            60-day free trial: no commissions or platform fees during the promotional onboarding window.
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Merchant Lite focus</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                Best for early-stage social commerce teams validating repeat dispatch flow with clear cost control and lower operational complexity.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Business focus</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                Best for merchants with higher volume, multi-staff coordination, and delivery orchestration needs that require faster support and integrations.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/for-businesses/apply/slyde">{primaryCta}</LinkButton>
            <LinkButton href="/for-businesses/grabquik" variant="secondary">{secondaryCta}</LinkButton>
          </div>
        </div>
      </section>
      <BusinessModelOverview variant={variant} />
    </>
  );
}
