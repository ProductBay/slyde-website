import type { Metadata } from "next";
import { MerchantForm } from "@/components/site/for-businesses/merchant-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "GrabQuik Merchant Application",
  "Apply for the GrabQuik merchant onboarding track inside the SLYDE platform.",
  "/for-businesses/apply/grabquik",
);

export default function GrabquikApplicationPage() {
  return (
    <section className="section-shell py-12">
      <MerchantForm
        track="grabquik"
        title="Start your GrabQuik merchant onboarding"
        description="Tell us about your business, where you operate, and how ready your storefront setup is. We will route your submission into the GrabQuik onboarding review flow."
      />
    </section>
  );
}
