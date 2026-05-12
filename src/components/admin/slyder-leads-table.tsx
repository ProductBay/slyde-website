"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Lock, MousePointer2, Settings2, X } from "lucide-react";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { SlyderLeadActionCenterActions } from "@/components/admin/slyder-lead-action-center-actions";
import { SlyderLeadMessageActions } from "@/components/admin/slyder-lead-message-actions";
import { SlyderLeadStatusBadge } from "@/components/admin/slyder-lead-status-badge";
import { LeadStatusLED } from "@/components/admin/lead-status-led";

type Lead = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  whatsapp: string;
  parish: string | null;
  vehicleType: string | null;
  status: string;
  referralCode: string | null;
  qualificationScore: number | null;
  actionCenterTitle: string | null;
  actionCenterBody: string | null;
  actionCenterCtaLabel: string | null;
  actionCenterCtaHref: string | null;
  applicationInviteUnlocked: boolean;
  applicationInviteUnlockedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function SlyderLeadsTable({ leads, devAdminKey }: { leads: Lead[]; devAdminKey?: string }) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [actionLead, setActionLead] = useState<Lead | null>(null);

  if (!leads.length) {
    return (
      <EmptyState
        title="No Slyder leads found"
        description="Leads appear here after visitors reserve a spot at /join/slyder."
      />
    );
  }

  return (
    <>
      <DataTable>
        <table className="min-w-[58rem] divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>WhatsApp</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Parish</TableHeaderCell>
              <TableHeaderCell>Vehicle</TableHeaderCell>
              <TableHeaderCell>Badge</TableHeaderCell>
              <TableHeaderCell>Score</TableHeaderCell>
              <TableHeaderCell>Activity</TableHeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {leads.map((lead) => {
              const fullName = getFullName(lead);
              return (
                <tr
                  key={lead.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open lead details for ${fullName}`}
                  onClick={() => setSelectedLead(lead)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedLead(lead);
                    }
                  }}
                  className="group cursor-pointer transition hover:bg-sky-50/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  <TableCell className="flex items-center justify-center">
                    <LeadStatusLED status={lead.status} applicationInviteUnlocked={lead.applicationInviteUnlocked} />
                  </TableCell>
                  <TableCell className="min-w-44 font-medium text-slate-950">
                    <div className="flex items-center justify-between gap-3">
                      <span>{fullName}</span>
                      <MousePointer2 className="h-4 w-4 text-slate-300 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-700">{lead.whatsapp}</TableCell>
                  <TableCell className="max-w-64 truncate">{lead.email}</TableCell>
                  <TableCell>{lead.parish ?? "-"}</TableCell>
                  <TableCell>{lead.vehicleType ?? "-"}</TableCell>
                  <TableCell>
                    <SlyderLeadStatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>
                    {lead.qualificationScore !== null ? (
                      <span className="tabular-nums text-slate-700">{lead.qualificationScore}/100</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {new Date(lead.updatedAt).toLocaleDateString("en-JM")}
                  </TableCell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTable>

      {selectedLead ? (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onOpenActions={() => setActionLead(selectedLead)}
        />
      ) : null}

      {actionLead ? (
        <LeadActionToolsModal
          lead={actionLead}
          devAdminKey={devAdminKey}
          onClose={() => setActionLead(null)}
        />
      ) : null}
    </>
  );
}

function getFullName(lead: Lead) {
  return [lead.firstName, lead.lastName].filter(Boolean).join(" ");
}

function DetailItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-950">{value || "-"}</p>
    </div>
  );
}

function LeadProgress({ lead }: { lead: Lead }) {
  const steps = [
    { label: "Lead saved", complete: true },
    { label: "Qualified", complete: ["QUALIFIED", "STARTED_APPLICATION", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "ACTIVATED", "LIVE"].includes(lead.status) },
    { label: "Next step unlocked", complete: lead.applicationInviteUnlocked },
    { label: "Application started", complete: ["STARTED_APPLICATION", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "ACTIVATED", "LIVE"].includes(lead.status) },
  ];
  const completeCount = steps.filter((step) => step.complete).length;
  const percent = Math.round((completeCount / steps.length) * 100);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lead progress</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">
            {lead.applicationInviteUnlocked ? "Next step is unlocked" : "Waiting for admin next-step trigger"}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${lead.applicationInviteUnlocked ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {lead.applicationInviteUnlocked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          {lead.applicationInviteUnlocked ? "Unlocked" : "Locked"}
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${step.complete ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
              {step.complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
            </span>
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadDetailModal({
  lead,
  onClose,
  onOpenActions,
}: {
  lead: Lead;
  onClose: () => void;
  onOpenActions: () => void;
}) {
  const fullName = getFullName(lead);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Slyder lead profile</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{fullName}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <SlyderLeadStatusBadge status={lead.status} />
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {new Date(lead.createdAt).toLocaleDateString("en-JM")}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
            aria-label="Close lead details"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-9rem)] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="WhatsApp" value={lead.whatsapp} />
            <DetailItem label="Email" value={lead.email} />
            <DetailItem label="Parish" value={lead.parish} />
            <DetailItem label="Vehicle" value={lead.vehicleType} />
            <DetailItem label="Score" value={lead.qualificationScore !== null ? `${lead.qualificationScore}/100` : null} />
            <DetailItem label="Referral Code" value={lead.referralCode} />
          </div>

          <div className="mt-5">
            <LeadProgress lead={lead} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Action Center</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">{lead.actionCenterTitle || "No active action title"}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{lead.actionCenterBody || "No Action Center message has been published for this lead yet."}</p>
              {lead.actionCenterCtaLabel || lead.actionCenterCtaHref ? (
                <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                  <p className="font-semibold">{lead.actionCenterCtaLabel || "CTA"}</p>
                  <p className="mt-1 break-words text-xs">{lead.actionCenterCtaHref || "-"}</p>
                </div>
              ) : null}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Lead actions</p>
              <h3 className="mt-2 text-lg font-semibold">Contact and update tools</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Open action tools to resend the lead email, create a WhatsApp follow-up, or publish an Action Center update.
              </p>
              <button
                type="button"
                onClick={onOpenActions}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
                Open action tools
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/admin/slyder-leads/${lead.id}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Open legacy detail page
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadActionToolsModal({
  lead,
  devAdminKey,
  onClose,
}: {
  lead: Lead;
  devAdminKey?: string;
  onClose: () => void;
}) {
  const fullName = getFullName(lead);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/72 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Action tools</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{fullName}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Send follow-ups or publish a lead Action Center update.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
            aria-label="Close action tools"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-950">Message tools</p>
            <SlyderLeadMessageActions leadId={lead.id} devAdminKey={devAdminKey} />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-950">Action Center tools</p>
            <SlyderLeadActionCenterActions
              leadId={lead.id}
              currentStatus={lead.status}
              currentTitle={lead.actionCenterTitle}
              currentBody={lead.actionCenterBody}
              currentCtaLabel={lead.actionCenterCtaLabel}
              currentCtaHref={lead.actionCenterCtaHref}
              applicationInviteUnlocked={lead.applicationInviteUnlocked}
              devAdminKey={devAdminKey}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
