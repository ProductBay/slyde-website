import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Business Qualification — SLYDE",
  "Tell us about your business so we can guide your onboarding to the SLYDE merchant network.",
  "/join/merchant/qualify",
);

export default function JoinMerchantQualifyPage() {
  return (
    <section className="section-shell py-16 sm:py-20">
      <div className="mx-auto max-w-reading text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
          Merchant Registration
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Register Your Business
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Full merchant registration and business onboarding is coming soon. In the meantime, you can submit your business interest through our existing channel.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/for-businesses/apply/slyde"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition duration-200 hover:-translate-y-0.5"
          >
            Submit Business Interest
          </Link>
          <Link
            href="/for-businesses"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition duration-200 hover:-translate-y-0.5"
          >
            Learn About SLYDE for Business
          </Link>
        </div>
      </div>
    </section>
  );
}
