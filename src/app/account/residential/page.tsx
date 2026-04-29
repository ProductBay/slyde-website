import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ResidentialDashboard } from "@/components/residential/residential-dashboard";
import { ResidentKycForm } from "@/components/residential/resident-kyc-form";
import { buildMetadata } from "@/lib/metadata";
import { getResidentialDashboardOverview } from "@/modules/residential-intake/services/residential-intake.service";
import { getResidentialKycStatus } from "@/modules/residential-intake/services/residential-kyc.service";
import { getSessionContext, hasRole } from "@/server/auth/session";

export const metadata: Metadata = buildMetadata(
  "Residential Dashboard",
  "Track residential dispatch requests and wallet balance in your SLYDE account dashboard.",
  "/account/residential",
);

export default async function ResidentialAccountPage() {
  const session = await getSessionContext();

  if (!session?.user?.isEnabled) {
    redirect("/login?next=/account/residential");
  }

  if (hasRole(session.user, ["platform_admin", "operations_admin"])) {
    redirect("/admin");
  }

  const [overview, kyc] = await Promise.all([
    getResidentialDashboardOverview(session.user.id),
    getResidentialKycStatus(session.user.id),
  ]);

  return (
    <section className="section-shell py-10 sm:py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Account
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-3xl">Residential Dashboard</h1>
          <p className="text-sm text-slate-500">
            Dispatch securely with wallet, card, gift card, or A'Dash scan-to-pay. Cash is disabled for residential safety.
          </p>
        </div>

        <ResidentKycForm
          status={kyc.status}
          reviewNotes={kyc.profile?.reviewNotes ?? null}
          submittedAt={kyc.profile?.submittedAt?.toISOString() ?? null}
        />

        <ResidentialDashboard wallet={overview.wallet} requests={overview.requests} transactions={overview.transactions} />
      </div>
    </section>
  );
}
