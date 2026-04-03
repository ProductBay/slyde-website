import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/link-button";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Grow with GrabQuik",
  "Use GrabQuik if you want marketplace exposure, storefront growth, and delivery support in one onboarding path.",
  "/for-businesses/grabquik",
);

export default function GrabquikOverviewPage() {
  return (
    <section className="section-shell py-12">
      <div className="surface-panel p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">GrabQuik Track</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Get customers and delivery together.</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
          GrabQuik is the better fit if you want SLYDE to help you grow customer demand, support your storefront presence,
          and include delivery in one merchant onboarding path.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/for-businesses/apply/grabquik">Start GrabQuik Onboarding</LinkButton>
          <LinkButton href="/for-businesses/slyde" variant="secondary">Compare with SLYDE Delivery</LinkButton>
        </div>
      </div>
    </section>
  );
}
