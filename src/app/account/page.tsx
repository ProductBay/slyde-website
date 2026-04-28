import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountDashboard } from "@/components/user/account-dashboard";
import { buildMetadata } from "@/lib/metadata";
import { getSessionContext, hasRole } from "@/server/auth/session";

export const metadata: Metadata = buildMetadata(
  "My Account",
  "Manage your SLYDE account — track parcels, refer friends, and get support.",
  "/account",
);

export default async function AccountPage() {
  const session = await getSessionContext();

  if (!session?.user.isEnabled) {
    redirect("/login");
  }

  // Admins go to the admin dashboard, not here
  if (hasRole(session.user, ["platform_admin", "operations_admin"])) {
    redirect("/admin");
  }

  return (
    <section className="section-shell py-10 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-3xl">My Account</h1>
          <p className="text-sm text-slate-500">Welcome back, {session.user.fullName.split(" ")[0]}.</p>
        </div>
        <AccountDashboard user={session.user} />
      </div>
    </section>
  );
}
