import type { Metadata } from "next";
import { BrandingInterestForm } from "@/components/site/vehicle-branding/branding-interest-form";
import { BrandingBannerStrip } from "@/components/site/vehicle-branding/branding-banner-strip";
import { BrandingOptions } from "@/components/site/vehicle-branding/branding-options";
import { BrandingTrustSection } from "@/components/site/vehicle-branding/branding-trust-section";
import { HowBrandingWorks } from "@/components/site/vehicle-branding/how-branding-works";
import { VehicleBrandingHero } from "@/components/site/vehicle-branding/vehicle-branding-hero";
import { VehicleShowcaseBanner } from "@/components/site/vehicle-branding/vehicle-showcase-banner";
import { buildMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = buildMetadata(
  "SLYDE Verified Vehicle Branding",
  "Request information about professional SLYDE vehicle branding for eligible Slyders across bikes, cars, vans, trucks, boxes, and helmets.",
  "/vehicle-branding",
);

export default function VehicleBrandingPage() {
  return (
    <>
      <VehicleBrandingHero />
      <VehicleShowcaseBanner />
      <BrandingTrustSection />
      <BrandingBannerStrip />
      <BrandingOptions />
      <HowBrandingWorks />
      <section className="section-shell py-14">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="eyebrow-badge border-sky-100 bg-sky-50 text-sky-700">Interest capture</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.35rem]">
              Ready to explore SLYDE branding for your setup?
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              Submit your interest and the team will contact you on WhatsApp with available branding options and next steps.
            </p>
          </div>
          <BrandingInterestForm />
        </div>
      </section>
    </>
  );
}
