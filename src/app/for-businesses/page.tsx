import type { Metadata } from "next";
import { ForBusinessesHero } from "@/components/site/for-businesses/hero";
import { ForBusinessesSplitOptions } from "@/components/site/for-businesses/split-options";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "For Businesses",
  "Choose between GrabQuik marketplace growth or SLYDE delivery-only onboarding based on how your business operates today.",
  "/for-businesses",
);

export default function ForBusinessesPage() {
  return (
    <>
      <ForBusinessesHero />
      <ForBusinessesSplitOptions />
    </>
  );
}
