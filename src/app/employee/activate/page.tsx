import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Employee Activation",
  "New SLYDE employees activate their invite, create a password, then continue into onboarding.",
  "/employee/activate",
);

export default function EmployeeActivatePage() {
  return (
    <section className="section-shell py-10 sm:py-12">
      <div className="employee-paper max-w-3xl p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Employee activation</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Open your employee invite</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          New SLYDE employees receive an activation email from admin review. Open the link from that email to create your password, then sign in and complete onboarding.
        </p>
      </div>
    </section>
  );
}
