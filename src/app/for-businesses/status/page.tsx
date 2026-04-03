import type { Metadata } from "next";
import { MerchantStatusChecker } from "@/components/site/for-businesses/merchant-status-checker";
import { SectionHeading } from "@/components/site/section-heading";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Merchant Application Status",
  "Check your SLYDE merchant onboarding review status and respond if SLYDE needs more information.",
  "/for-businesses/status",
);

export default async function MerchantStatusPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const initialToken = Array.isArray(resolvedSearchParams?.token)
    ? resolvedSearchParams.token[0] ?? ""
    : resolvedSearchParams?.token ?? "";

  return (
    <>
      <section className="section-shell pt-12">
        <SectionHeading
          eyebrow="Merchant Application Tracking"
          title="Track your onboarding review without waiting in the dark"
          description="Use the same email and phone from your merchant submission to see your review status, understand the next step, and send additional information if SLYDE requested it. If SLYDE sent you a secure status link, your application details will open automatically."
        />
      </section>
      <MerchantStatusChecker initialToken={initialToken} />
    </>
  );
}
