import type { Metadata } from "next";
import { EmployeeApplicationForm } from "@/components/employee/employee-application-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Apply for a SLYDE Employee Role",
  "Apply for internal SLYDE employee positions including logistics, support, finance, and management roles.",
  "/careers/apply",
);

export default function CareersApplyPage() {
  return (
    <section className="section-shell py-10 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="employee-hero-panel overflow-hidden p-8">
          <div className="employee-hero-orb left-[-10%] top-[-16%] h-40 w-40" />
          <div className="employee-hero-orb bottom-[-12%] right-[-6%] h-48 w-48" />
          <div className="relative space-y-5">
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
              SLYDE careers
            </div>
            <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.03em] text-white">Apply for internal employee positions.</h1>
            <p className="max-w-xl text-sm leading-7 text-slate-200">
              Use this path for logistics employees, internal operations staff, support teams, payroll, supervisors, and managers. It is separate from the courier onboarding funnel.
            </p>
          </div>
        </div>
        <EmployeeApplicationForm />
      </div>
    </section>
  );
}
