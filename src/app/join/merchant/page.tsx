import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { Building2, ArrowRight } from "lucide-react";

export const metadata: Metadata = buildMetadata(
  "Register Your Business on SLYDE",
  "Use SLYDE to manage local deliveries for your business. Structured dispatch, no fleet required.",
  "/join/merchant",
);

export default function JoinMerchantPage() {
  return (
    <section className="section-shell py-16 sm:py-20">
      <div className="mx-auto max-w-content">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
              <Building2 className="h-7 w-7" />
            </div>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              For Businesses
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-[2.8rem]">
              Become a Merchant
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Use SLYDE to manage local deliveries for your business. Access the network of Slyders, manage dispatches, and track deliveries — no fleet required.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/join/merchant/qualify"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition duration-200 hover:-translate-y-0.5"
              >
                Register My Business
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/for-businesses"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition duration-200 hover:-translate-y-0.5"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="surface-panel p-6 sm:p-8">
            <p className="text-sm font-semibold text-slate-800 mb-4">What merchants get</p>
            <div className="space-y-3">
              {[
                "Access to a growing network of verified Slyders across Jamaica",
                "Structured dispatch — create delivery requests from your dashboard",
                "Track deliveries in real time",
                "No fleet, no logistics headaches",
                "Launch in your area when your zone goes live",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-surface-1 px-4 py-3 text-sm leading-6 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
