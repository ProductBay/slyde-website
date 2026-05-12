import type { Metadata } from "next";
import { ForBusinessesHero } from "@/components/site/for-businesses/hero";
import { BusinessModelOverview } from "@/components/site/for-businesses/business-model-overview";
import { ForBusinessesSplitOptions } from "@/components/site/for-businesses/split-options";
import { buildMetadata } from "@/lib/metadata";

function resolveVariant(value: string | string[] | undefined): "a" | "b" {
  if (Array.isArray(value)) {
    return value[0] === "b" ? "b" : "a";
  }
  return value === "b" ? "b" : "a";
}

export const metadata: Metadata = buildMetadata(
  "For Businesses",
  "Choose between GrabQuik marketplace growth or SLYDE delivery-only onboarding based on how your business operates today.",
  "/for-businesses",
);

export default async function ForBusinessesPage({
  searchParams,
}: {
  searchParams?: Promise<{ ab?: string | string[] }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const variant = resolveVariant(resolvedSearchParams?.ab);

  return (
    <>
      <ForBusinessesHero />
      <BusinessModelOverview variant={variant} />
      <ForBusinessesSplitOptions />
    </>
  );
}
