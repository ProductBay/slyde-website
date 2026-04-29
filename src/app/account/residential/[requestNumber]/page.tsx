import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import {
  getDispatchRequestDetail,
  getDispatchRequestLivePickupPing,
} from "@/modules/residential-intake/repositories/residential-intake.repository";
import { getSessionContext, hasRole } from "@/server/auth/session";
import { RequestDetailView } from "@/components/residential/request-detail-view";

export const metadata: Metadata = buildMetadata(
  "Dispatch Request Detail",
  "View the full timeline and status of your residential dispatch request.",
  "/account/residential",
);

export default async function ResidentialRequestDetailPage({
  params,
}: {
  params: Promise<{ requestNumber: string }>;
}) {
  const session = await getSessionContext();

  if (!session?.user?.isEnabled) {
    redirect("/login?next=/account/residential");
  }

  if (hasRole(session.user, ["platform_admin", "operations_admin"])) {
    redirect("/admin");
  }

  const { requestNumber } = await params;
  const [request, livePickupPin] = await Promise.all([
    getDispatchRequestDetail(requestNumber, session.user.id),
    getDispatchRequestLivePickupPing(requestNumber, session.user.id),
  ]);

  if (!request) {
    notFound();
  }

  return (
    <section className="section-shell py-10 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/account/residential"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Residential Dashboard
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-3xl">
            Request {request.referenceCode}
          </h1>
          <p className="text-sm text-slate-500">
            Full timeline and status for this dispatch request.
          </p>
        </div>

        <RequestDetailView request={request} livePickupPin={livePickupPin} />
      </div>
    </section>
  );
}
