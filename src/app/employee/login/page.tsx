import type { Metadata } from "next";
import { EmployeeLoginForm } from "@/components/employee/employee-login-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Employee Portal Login",
  "Sign in to the dedicated SLYDE employee portal for onboarding, announcements, payroll visibility, and guides.",
  "/employee/login",
);

export default function EmployeeLoginPage() {
  return (
    <section className="section-shell py-10 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="employee-hero-panel overflow-hidden p-8">
          <div className="employee-hero-orb left-[-10%] top-[-16%] h-40 w-40" />
          <div className="employee-hero-orb bottom-[-12%] right-[-6%] h-48 w-48" />
          <div className="relative space-y-5">
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
              SLYDE employees
            </div>
            <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.03em] text-white">A dedicated internal portal for staff operations.</h1>
            <p className="max-w-xl text-sm leading-7 text-slate-200">
              Employees use this portal for manager updates, digital guides, onboarding completion, payroll visibility, and internal profile management. This is no longer routed through the Slyder app.
            </p>
          </div>
        </div>
        <EmployeeLoginForm />
      </div>
    </section>
  );
}
