import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail, MessageCircle, Phone } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { SlyderLeadActionCenterActions } from "@/components/admin/slyder-lead-action-center-actions";
import { SlyderLeadMessageActions } from "@/components/admin/slyder-lead-message-actions";
import { SlyderLeadStatusBadge } from "@/components/admin/slyder-lead-status-badge";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { findLeadById } from "@/modules/leads/repositories/slyder-lead.repository";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null | undefined) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-JM", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function labelize(value: string | null | undefined) {
  if (!value) return "Not provided";
  return value.replace(/_/g, " ").toLowerCase();
}

function DetailItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value ?? "Not provided"}</p>
    </div>
  );
}

export default async function AdminSlyderLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ user, mode }, lead] = await Promise.all([getAdminPageContext(), findLeadById(id)]);
  const devAdminKey = mode === "development" ? process.env.SLYDE_ADMIN_DEV_KEY || "dev-admin-key" : undefined;

  if (!lead) {
    return (
      <AdminShell
        title="Slyder lead not found"
        description="The selected Slyder lead could not be found."
        adminName={user.fullName}
        mode={mode}
      >
        <Link href="/admin/slyder-leads" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Slyder leads
        </Link>
      </AdminShell>
    );
  }

  const fullName = [lead.firstName, lead.lastName].filter(Boolean).join(" ");
  const statusUrl = `/join/slyder/status?leadId=${encodeURIComponent(lead.id)}`;

  return (
    <AdminShell
      title={fullName || "Slyder lead"}
      description="Review lead details, publish Action Center updates, and resend email or WhatsApp follow-ups."
      adminName={user.fullName}
      mode={mode}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/slyder-leads" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Slyder leads
        </Link>
        <Link
          href={statusUrl}
          target="_blank"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-sky-200 hover:bg-sky-50"
        >
          Public status page
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Lead profile</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{fullName}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <SlyderLeadStatusBadge status={lead.status} />
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                  {labelize(lead.vehicleType)}
                </span>
              </div>
            </div>
            <SlyderLeadMessageActions leadId={lead.id} devAdminKey={devAdminKey} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <DetailItem label="Email" value={lead.email} />
            <DetailItem label="WhatsApp" value={lead.whatsapp} />
            <DetailItem label="Parish" value={lead.parish} />
            <DetailItem label="Referral code" value={lead.referralCode} />
            <DetailItem label="Source" value={lead.source} />
            <DetailItem label="Qualification score" value={lead.qualificationScore !== null ? `${lead.qualificationScore}/100` : null} />
            <DetailItem label="Created" value={formatDate(lead.createdAt)} />
            <DetailItem label="Last contacted" value={formatDate(lead.lastContactedAt)} />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Qualification notes</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{lead.qualificationNotes || "No qualification notes have been added yet."}</p>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Action Center</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Lead-facing update</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This is what the lead sees on their Slyder Lead Dashboard. Email and WhatsApp should point them back here for the latest next step.
          </p>

          <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <p className="text-sm font-semibold text-slate-950">{lead.actionCenterTitle || "No custom Action Center update yet"}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {lead.actionCenterBody || "The dashboard is currently using the default status guidance for this lead."}
            </p>
            {lead.actionCenterCtaLabel && lead.actionCenterCtaHref ? (
              <p className="mt-3 text-xs font-semibold text-sky-800">
                CTA: {lead.actionCenterCtaLabel} to {lead.actionCenterCtaHref}
              </p>
            ) : null}
            <p className="mt-3 text-xs font-semibold text-slate-500">Updated: {formatDate(lead.actionCenterUpdatedAt)}</p>
          </div>

          <div className="mt-5">
            <SlyderLeadActionCenterActions
              leadId={lead.id}
              currentStatus={lead.status}
              currentTitle={lead.actionCenterTitle}
              currentBody={lead.actionCenterBody}
              currentCtaLabel={lead.actionCenterCtaLabel}
              currentCtaHref={lead.actionCenterCtaHref}
              devAdminKey={devAdminKey}
            />
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <Mail className="h-5 w-5 text-sky-700" />
          <p className="mt-3 text-sm font-semibold text-slate-950">Email updates</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{lead.email}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <MessageCircle className="h-5 w-5 text-emerald-700" />
          <p className="mt-3 text-sm font-semibold text-slate-950">WhatsApp updates</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{lead.whatsapp}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <Phone className="h-5 w-5 text-slate-700" />
          <p className="mt-3 text-sm font-semibold text-slate-950">Application link</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{lead.applicationId || "Not connected to an application yet."}</p>
        </div>
      </div>
    </AdminShell>
  );
}
