import type { Metadata } from "next";
import { MerchantForm } from "@/components/site/for-businesses/merchant-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "SLYDE Delivery Merchant Application",
  "Apply for the SLYDE delivery-only merchant onboarding track.",
  "/for-businesses/apply/slyde",
);

export default function SlydeMerchantApplicationPage() {
  return (
    <section className="section-shell py-12">
      <MerchantForm
        track="slyde_delivery"
        title="Start your SLYDE delivery onboarding"
        description="Tell us how you already take orders, how your dispatch should work, and what delivery support you need. We will route your business into the SLYDE delivery onboarding review flow."
      />
    </section>
  );
}
