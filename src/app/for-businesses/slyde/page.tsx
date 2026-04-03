import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/link-button";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Use SLYDE for Delivery",
  "Use SLYDE delivery-only onboarding if you already have customers and only need a cleaner delivery operation.",
  "/for-businesses/slyde",
);

export default function SlydeDeliveryOverviewPage() {
  return (
    <section className="section-shell py-12">
      <div className="surface-panel p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">SLYDE Delivery Track</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Keep your customers. Let SLYDE handle delivery.</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
          This track is for merchants already selling through Instagram, WhatsApp, a website, or direct customer channels.
          Start with delivery now, then upgrade to GrabQuik later if you want storefront growth.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/for-businesses/apply/slyde">Start SLYDE Delivery Onboarding</LinkButton>
          <LinkButton href="/for-businesses/grabquik" variant="secondary">See GrabQuik Option</LinkButton>
        </div>
      </div>
    </section>
  );
}
