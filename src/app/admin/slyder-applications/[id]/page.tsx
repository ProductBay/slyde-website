import { notFound } from "next/navigation";
import { ActionModal } from "@/components/admin/action-modal";
import { AdminShell } from "@/components/admin/admin-shell";
import { DocumentReviewCard } from "@/components/admin/document-review-card";
import { KpiStatCard } from "@/components/admin/kpi-stat-card";
import { NotificationStatusList } from "@/components/admin/notification-status-list";
import { StatusBadge } from "@/components/admin/status-badge";
import { Timeline } from "@/components/admin/timeline";
import { getAdminApplicationDetail } from "@/modules/admin/services/admin-control-tower.service";
import { getAdminPageContext } from "@/server/admin/admin-page";

function DetailGrid({
  items,
}: {
  items: Array<{ label: string; value: string | number | boolean | undefined | null }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-2xl border border-slate-200 bg-surface-1 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
          <p className="mt-2 break-words text-sm leading-7 text-slate-800">
            {item.value === true ? "Yes" : item.value === false ? "No" : item.value || "Not provided"}
          </p>
        </div>
      ))}
    </div>
  );
}

function ReferralSourceLabel({
  source,
}: {
  source?: "code" | "invite_link" | "none";
}) {
  const label =
    source === "invite_link"
      ? "Invite link"
      : source === "code"
        ? "Referral code"
        : "No referral";

  const tone =
    source === "invite_link"
      ? "border-sky-100 bg-sky-50 text-sky-700"
      : source === "code"
        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-slate-50 text-slate-500";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${tone}`}>{label}</span>;
}

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ user, mode }, detail] = await Promise.all([
    getAdminPageContext(),
    getAdminApplicationDetail(id).catch(() => null),
  ]);

  if (!detail) notFound();

  return (
    <AdminShell
      title="Application Review Workspace"
      description="Review applicant details, documents, notification history, and readiness impact before taking approval actions."
      adminName={user.fullName}
      mode={mode}
    >
      <section className="surface-panel overflow-hidden p-6">
        <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">{detail.application.fullName}</h2>
              <StatusBadge status={detail.application.applicationStatus} />
            </div>
            <p className="mt-3 text-sm uppercase tracking-[0.18em] text-slate-500">{detail.application.applicationCode}</p>
            <p className="mt-4 break-words text-sm leading-7 text-slate-600">
              {detail.application.parish} / {detail.application.zoneName} · {detail.application.courierType} · Submitted{" "}
              {new Date(detail.application.submittedAt).toLocaleString("en-JM")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 2xl:max-w-[28rem] 2xl:justify-end">
            <ActionModal
              triggerLabel="Approve"
              title="Approve applicant"
              description="This will approve the application, create or link the Slyder account, provision the profile, and begin activation."
              endpoint={`/api/admin/slyder-applications/${detail.application.id}/approve`}
              payload={{ activationChannel: "email" }}
              confirmLabel="Approve & create access"
              kind="approve"
            />
            <ActionModal
              triggerLabel="Reject"
              title="Reject application"
              description="Reject this applicant and record a clear reason for the review decision."
              endpoint={`/api/admin/slyder-applications/${detail.application.id}/reject`}
              payload={{}}
              confirmLabel="Reject application"
              kind="reject"
            />
            <ActionModal
              triggerLabel="Request documents"
              title="Request additional documents"
              description="Ask the applicant to provide missing documents or updated records before review continues."
              endpoint={`/api/admin/slyder-applications/${detail.application.id}/request-documents`}
              payload={{}}
              confirmLabel="Request documents"
              kind="request-documents"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiStatCard label="WhatsApp Status" value={detail.application.whatsappStatus === "sent" ? 1 : 0} subtext={detail.application.whatsappStatus} />
        <KpiStatCard label="Email Status" value={detail.application.emailStatus === "sent" ? 1 : 0} subtext={detail.application.emailStatus} />
        <KpiStatCard
          label="Zone Readiness"
          value={detail.zone.metrics.readinessPercentage}
          subtext={`${detail.zone.name} readiness`}
          note={`${detail.zone.metrics.remainingNeeded} more needed`}
        />
        <KpiStatCard label="Linked Account" value={detail.linkedUser ? 1 : 0} subtext={detail.linkedUser ? detail.linkedUser.accountStatus : "Not created"} />
        <KpiStatCard
          label="Linked Profile"
          value={detail.linkedSlyderProfile ? 1 : 0}
          subtext={detail.linkedSlyderProfile ? detail.linkedSlyderProfile.readinessStatus : "Not created"}
        />
        <KpiStatCard label="Readiness Impact" value={detail.readinessContribution.projectedPercentage} subtext={detail.readinessContribution.message} />
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <div className="min-w-0 space-y-8">
          <div className="surface-panel p-6">
            <h3 className="text-xl font-semibold text-slate-950">Personal details</h3>
            <div className="mt-5">
              <DetailGrid
                items={[
                  { label: "Full name", value: detail.application.fullName },
                  { label: "Date of birth", value: detail.application.dateOfBirth },
                  { label: "Phone", value: detail.application.phone },
                  { label: "Email", value: detail.application.email },
                  { label: "Address", value: detail.application.address },
                  { label: "Parish", value: detail.application.parish },
                  { label: "TRN", value: detail.application.trn },
                  { label: "Emergency contact", value: `${detail.application.emergencyContactName} · ${detail.application.emergencyContactPhone}` },
                ]}
              />
            </div>
          </div>

          <div className="surface-panel p-6">
            <h3 className="text-xl font-semibold text-slate-950">Courier and vehicle details</h3>
            <div className="mt-5">
              <DetailGrid
                items={[
                  { label: "Courier type", value: detail.application.courierType },
                  { label: "Vehicle make", value: detail.vehicle?.make },
                  { label: "Vehicle model", value: detail.vehicle?.model },
                  { label: "Year", value: detail.vehicle?.year },
                  { label: "Color", value: detail.vehicle?.color },
                  { label: "Plate number", value: detail.vehicle?.plateNumber },
                  { label: "Registration expiry", value: detail.vehicle?.registrationExpiry },
                  { label: "Insurance expiry", value: detail.vehicle?.insuranceExpiry },
                  { label: "Fitness expiry", value: detail.vehicle?.fitnessExpiry },
                ]}
              />
            </div>
          </div>

          <div className="surface-panel p-6">
            <h3 className="text-xl font-semibold text-slate-950">Work preferences and readiness</h3>
            <div className="mt-5">
              <DetailGrid
                items={[
                  { label: "Availability", value: detail.application.availability },
                  { label: "Preferred zones", value: detail.application.preferredZones.join(", ") },
                  { label: "Work type preference", value: detail.application.workTypePreference },
                  { label: "Max travel comfort", value: detail.application.maxTravelComfort },
                  { label: "Peak hours", value: detail.application.peakHours },
                  { label: "Delivery types", value: detail.application.deliveryTypePreferences.join(", ") || "Not specified" },
                  { label: "Smartphone type", value: detail.application.smartphoneType },
                  { label: "WhatsApp number", value: detail.application.whatsappNumber },
                  { label: "GPS enabled", value: detail.application.gpsConfirmed },
                  { label: "Internet confirmed", value: detail.application.internetConfirmed },
                ]}
              />
            </div>
          </div>

          <div className="surface-panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-950">Referral attribution</h3>
              <ReferralSourceLabel source={detail.application.referralAttribution?.referralSource || "none"} />
            </div>
            <div className="mt-5">
              <DetailGrid
                items={[
                  { label: "Referral code", value: detail.application.referralAttribution?.referralCode },
                  { label: "Invite token", value: detail.application.referralAttribution?.inviteToken ? "Captured" : undefined },
                  { label: "Captured at", value: detail.application.referralAttribution?.capturedAt ? new Date(detail.application.referralAttribution.capturedAt).toLocaleString("en-JM") : undefined },
                  { label: "Landing page", value: detail.application.referralAttribution?.landingPage },
                ]}
              />
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This attribution was captured on the public website and forwarded to the SLYDE app for referral validation, qualification, and reward processing.
            </p>
          </div>

          <div className="surface-panel p-6">
            <h3 className="text-xl font-semibold text-slate-950">Documents</h3>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {detail.documents.map((document) => (
                <DocumentReviewCard key={document.id} applicationId={detail.application.id} document={document} />
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-8">
          <div className="surface-panel p-6">
            <h3 className="text-xl font-semibold text-slate-950">Zone and account summary</h3>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-surface-1 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Zone readiness</p>
                <p className="mt-2 break-words text-lg font-semibold text-slate-950">
                  {detail.zone.name} · {detail.zone.metrics.readinessPercentage}% ready
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{detail.readinessContribution.message}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-surface-1 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Linked account status</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <StatusBadge status={detail.linkedUser?.accountStatus || "disabled"} />
                  <StatusBadge status={detail.linkedSlyderProfile?.readinessStatus || "pending"} />
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Notification History</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">WhatsApp and email activity</h3>
              </div>
            </div>
            <NotificationStatusList items={detail.notificationHistory} allowResend />
          </div>

          <div className="min-w-0">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Status History</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">Audit timeline</h3>
            </div>
            <Timeline
              items={detail.auditTimeline.map((item) => ({
                id: item.id,
                title: item.eventType.replace(/_/g, " "),
                meta: `${item.actorLabel || "System"} · ${new Date(item.createdAt).toLocaleString("en-JM")}`,
                body: item.metadata ? JSON.stringify(item.metadata, null, 2) : undefined,
              }))}
            />
          </div>
        </div>
      </section>

      <section className="mt-8 surface-panel p-6">
        <h3 className="text-xl font-semibold text-slate-950">Action workspace</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Use the review actions below to approve the applicant, reject the application, or request more documents. These actions write to the onboarding workflow and refresh the dashboard immediately.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ActionModal
            triggerLabel="Approve applicant"
            title="Approve applicant"
            description="This applicant will be approved, linked to a Slyder account, and moved into activation and setup."
            endpoint={`/api/admin/slyder-applications/${detail.application.id}/approve`}
            payload={{ activationChannel: "email" }}
            confirmLabel="Approve & create access"
            kind="approve"
          />
          <ActionModal
            triggerLabel="Reject applicant"
            title="Reject application"
            description="Reject this application and store a clear reason for the operations record."
            endpoint={`/api/admin/slyder-applications/${detail.application.id}/reject`}
            payload={{}}
            confirmLabel="Reject application"
            kind="reject"
          />
          <ActionModal
            triggerLabel="Request more documents"
            title="Request additional documents"
            description="Send the applicant a request for more documents or clearer uploads before the review continues."
            endpoint={`/api/admin/slyder-applications/${detail.application.id}/request-documents`}
            payload={{}}
            confirmLabel="Request documents"
            kind="request-documents"
          />
        </div>
      </section>
    </AdminShell>
  );
}
