import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { buildMetadata } from "@/lib/metadata";
import { getSessionContext, hasRole } from "@/server/auth/session";

export const metadata: Metadata = buildMetadata(
  "Admin Login",
  "Sign in to the SLYDE operations and platform control tower.",
  "/admin/login",
);

export default async function AdminLoginPage() {
  const session = await getSessionContext();
  if (session && session.user.isEnabled && hasRole(session.user, ["platform_admin", "operations_admin"])) {
    redirect("/admin");
  }

  return (
    <section className="section-shell py-10 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="employee-hero-panel overflow-hidden p-8">
          <div className="employee-hero-orb left-[-10%] top-[-16%] h-40 w-40" />
          <div className="employee-hero-orb bottom-[-12%] right-[-6%] h-48 w-48" />
          <div className="relative space-y-5">
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
              SLYDE control tower
            </div>
            <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.03em] text-white">A dedicated admin entry point for platform operations.</h1>
            <p className="max-w-xl text-sm leading-7 text-slate-200">
              Use this page to access the live admin workspace for application review, coverage readiness, notifications, legal controls, and launch operations.
            </p>
          </div>
        </div>
        <AdminLoginForm />
      </div>
    </section>
  );
}
