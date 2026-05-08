import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building2, CheckCircle2, Network, Truck } from "lucide-react";
import { FleetLeadForm } from "@/components/site/join/fleet-lead-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Join SLYDE as a Fleet Partner",
  "Fleet owners and delivery companies can submit interest to partner with SLYDE across Jamaica.",
  "/join/fleet",
);

const benefits = [
  "Register company-owned drivers separately from individual Slyders",
  "Share available vehicle capacity by parish or operating area",
  "Explore transfer, final-mile, or managed delivery partnership options",
  "Coordinate next steps directly with the SLYDE team on WhatsApp",
];

export default function JoinFleetPage() {
  return (
    <section className="section-shell py-12 sm:py-16">
      <div className="mx-auto max-w-content">
        <Link href="/join" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to join options
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-6 lg:sticky lg:top-28">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">Fleet / Company Owners</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-[2.8rem]">
                Partner your fleet with SLYDE
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                This route is for fleet owners, courier companies, and operators with multiple vehicles or drivers who want to explore SLYDE partnership opportunities.
              </p>
            </div>

            <div className="grid gap-3">
              {benefits.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.75rem] border border-slate-900 bg-slate-950 p-6 text-white">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Truck, label: "Fleet capacity" },
                  { icon: Network, label: "Operating areas" },
                  { icon: Building2, label: "Company model" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <item.icon className="h-5 w-5 text-sky-300" />
                    <p className="mt-3 text-sm font-semibold">{item.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                Submitting this form does not approve a fleet partnership. SLYDE will review fit, coverage, readiness, and operational standards before any partnership moves forward.
              </p>
            </div>
          </div>

          <FleetLeadForm />
        </div>
      </div>
    </section>
  );
}
