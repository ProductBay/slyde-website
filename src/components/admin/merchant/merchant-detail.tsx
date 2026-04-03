"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Store,
  UserRoundCog,
} from "lucide-react";
import type { MerchantApplication, MerchantIntegrationProfile, MerchantLead } from "@/types/backend/onboarding";
import { MerchantStatusBadge } from "@/components/admin/merchant/merchant-status-badge";

function formatLabel(value?: string | null) {
  if (!value) return "Not set";
  return value.replaceAll("_", " ");
}

function DetailMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-200/40">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold capitalize text-slate-950">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-6 text-slate-500">{hint}</p> : null}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-200/30">
      <div className="mt-0.5 rounded-xl bg-slate-100 p-2 text-slate-600">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-medium leading-7 text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export function MerchantDetail({
  application,
  lead,
  integrationProfile,
  currentAdminId,
  devAdminKey,
}: {
  application: MerchantApplication;
  lead: MerchantLead | null;
  integrationProfile: MerchantIntegrationProfile | null;
  currentAdminId?: string;
  devAdminKey?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [requestInfoNote, setRequestInfoNote] = useState(
    "Please reply with the missing business details or clarification SLYDE requested so review can continue.",
  );

  const businessName = lead?.businessName || application.storeName || "Merchant application";
  const contactLabel = [lead?.contactName, lead?.email, lead?.phone].filter(Boolean).join(" | ");
  const canResendActivation = ["activated", "live"].includes(application.activationStatus);
  const canVerifyBusinessLicense =
    application.businessLicenseStatus === "submitted" && Boolean(application.businessLicenseNumber);

  async function runAction(path: string, body?: Record<string, unknown>) {
    setError(null);
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(devAdminKey ? { "x-slyde-admin-key": devAdminKey } : {}),
      },
      body: body ? JSON.stringify(body) : "{}",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(typeof payload?.error === "string" ? payload.error : "Action failed.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <div className="surface-panel overflow-hidden p-0">
        <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_34%),linear-gradient(135deg,#f8fbff_0%,#ffffff_58%,#f8fafc_100%)] px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-lg shadow-slate-950/15">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">Merchant application</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">{businessName}</h1>
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                Review the merchant&apos;s onboarding posture, operational readiness, activation state, and next control-tower actions from one decision surface.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <MerchantStatusBadge status={application.onboardingTrack} />
                <MerchantStatusBadge status={application.approvalStatus} />
                <MerchantStatusBadge status={application.activationStatus} />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <DetailMetric
                  label="Merchant contact"
                  value={lead?.contactName || "Unknown"}
                  hint={contactLabel || "No merchant contact details recorded yet."}
                />
                <DetailMetric
                  label="Current review state"
                  value={`${formatLabel(application.approvalStatus)} / ${formatLabel(application.activationStatus)}`}
                  hint={`Lead status: ${formatLabel(lead?.status || "unknown")}`}
                />
                <DetailMetric
                  label="Created"
                  value={new Date(application.createdAt).toLocaleString("en-JM")}
                  hint={`Last updated ${new Date(application.updatedAt).toLocaleString("en-JM")}`}
                />
              </div>
            </div>

            <div className="grid min-w-0 gap-3 rounded-[1.75rem] border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-200/40 xl:w-[22rem]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Control actions</p>
              <button
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
                disabled={pending || !currentAdminId}
                onClick={() =>
                  startTransition(() =>
                    void runAction(`/api/admin/merchant-applications/${application.id}/assign-admin`, {
                      assignedAdminId: currentAdminId,
                    }),
                  )
                }
              >
                Assign to me
              </button>
              <button
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                disabled={pending}
                onClick={() => startTransition(() => void runAction(`/api/admin/merchant-applications/${application.id}/approve`))}
              >
                Approve application
              </button>
              <button
                className="rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-60"
                disabled={pending || !requestInfoNote.trim()}
                onClick={() =>
                  startTransition(() =>
                    void runAction(`/api/admin/merchant-applications/${application.id}/request-info`, {
                      notes: requestInfoNote,
                    }),
                  )
                }
              >
                Request more information
              </button>
              <button
                className="rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
                disabled={pending}
                onClick={() =>
                  startTransition(() =>
                    void runAction(`/api/admin/merchant-applications/${application.id}/activate`, {
                      activationStatus: "activated",
                    }),
                  )
                }
              >
                Activate merchant access
              </button>
              <button
                className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                disabled={pending}
                onClick={() =>
                  startTransition(() =>
                    void runAction(`/api/admin/merchant-applications/${application.id}/activate`, {
                      activationStatus: "live",
                    }),
                  )
                }
              >
                Mark merchant live
              </button>
              <button
                className="rounded-full bg-indigo-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60"
                disabled={pending || !canVerifyBusinessLicense}
                onClick={() =>
                  startTransition(() =>
                    void runAction(`/api/admin/merchant-applications/${application.id}/verify-business-license`),
                  )
                }
              >
                Verify business license
              </button>
              <button
                className="rounded-full bg-violet-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:opacity-60"
                disabled={pending || !canResendActivation}
                onClick={() =>
                  startTransition(() =>
                    void runAction(`/api/admin/merchant-applications/${application.id}/resend-activation`),
                  )
                }
              >
                Resend activation
              </button>
              <button
                className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
                disabled={pending}
                onClick={() =>
                  startTransition(() =>
                    void runAction(`/api/admin/merchant-applications/${application.id}/reject`, {
                      notes: "Rejected by admin.",
                    }),
                  )
                }
              >
                Reject application
              </button>
              <p className="text-xs leading-6 text-slate-500">
                Activation resend is only available after the merchant has been moved into an activated or live state.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 sm:px-8">
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Business overview</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-950">Commercial and account context</h2>
                </div>
                <div className="rounded-xl bg-white p-2 text-slate-600 shadow-sm shadow-slate-200/40">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                <DetailRow icon={<BriefcaseBusiness className="h-4 w-4" />} label="Business name" value={businessName} />
                <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={lead?.email || "Not provided"} />
                <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={lead?.phone || "Not provided"} />
                <DetailRow icon={<MapPin className="h-4 w-4" />} label="Parish / town" value={`${lead?.parish || "Unknown"} | ${lead?.town || "Unknown"}`} />
                <DetailRow icon={<Store className="h-4 w-4" />} label="Pickup address" value={application.pickupAddress || "Pending"} />
                <DetailRow icon={<ShieldCheck className="h-4 w-4" />} label="Business license number" value={application.businessLicenseNumber || "Not submitted yet"} />
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Review controls</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-950">Operational review posture</h2>
                </div>
                <div className="rounded-xl bg-white p-2 text-slate-600 shadow-sm shadow-slate-200/40">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <DetailMetric label="Lead status" value={formatLabel(lead?.status || "unknown")} />
                <DetailMetric label="Document status" value={formatLabel(application.documentStatus)} />
                <DetailMetric label="Legal status" value={formatLabel(application.legalStatus)} />
                <DetailMetric label="Assigned admin" value={application.assignedAdminId || "Unassigned"} />
                <DetailMetric label="Business license status" value={formatLabel(application.businessLicenseStatus)} />
                <DetailMetric
                  label="Grace threshold"
                  value={`${application.businessLicenseRequiredAfterDeliveries} deliveries / 30 days`}
                  hint={application.businessLicenseGraceEndsAt ? `Grace ends ${new Date(application.businessLicenseGraceEndsAt).toLocaleDateString("en-JM")}` : undefined}
                />
              </div>
            </section>
          </div>

          {integrationProfile ? (
            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Integration profile</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-950">Delivery operations configuration</h2>
                </div>
                <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                  <UserRoundCog className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <DetailMetric label="Dispatch mode" value={formatLabel(integrationProfile.dispatchMode)} />
                <DetailMetric label="Readiness" value={formatLabel(integrationProfile.integrationReadiness)} />
                <DetailMetric label="Package types" value={integrationProfile.packageTypes.join(", ") || "Not set"} />
                <DetailMetric label="Pickup locations" value={integrationProfile.pickupLocations.join(", ") || "Not set"} />
              </div>
            </section>
          ) : null}

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Merchant follow-up request</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-950">Request missing details without leaving the review surface</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Send a structured follow-up request directly into the merchant status timeline so the applicant sees the exact clarification SLYDE still needs.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
                <Send className="h-3.5 w-3.5" />
                Public status page delivery
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-950">Request note</span>
                  <textarea
                    className="field-input mt-3 min-h-32 bg-white"
                    value={requestInfoNote}
                    onChange={(event) => setRequestInfoNote(event.target.value)}
                    placeholder="Ask the merchant for missing business details, clarification, documents, or launch information."
                  />
                </label>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  The merchant sees this in their public status flow and can reply directly from the secure SLYDE status page.
                </p>
              </div>
              <div className="flex min-w-[15rem] flex-col justify-between rounded-[1.5rem] border border-sky-200 bg-sky-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Recommended operator flow</p>
                  <div className="mt-3 space-y-3 text-sm text-slate-700">
                    <p className="flex items-start gap-2">
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-sky-700" />
                      Review operational fit and compliance posture
                    </p>
                    <p className="flex items-start gap-2">
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-sky-700" />
                      Request clarity before approval when details are still weak
                    </p>
                    <p className="flex items-start gap-2">
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-sky-700" />
                      Activate merchant access only when the workspace path is ready
                    </p>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl bg-white px-4 py-3 text-xs leading-6 text-slate-500 shadow-sm shadow-slate-200/40">
                  Use <span className="font-semibold text-slate-700">Resend activation</span> for already-approved merchants who missed the invite but still have not created a password.
                </div>
              </div>
            </div>
          </section>

          {error ? (
            <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/60 px-5 py-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-950">Review surface is ready</p>
              <p className="mt-2 leading-7">
                Current actions preserve the existing merchant approval and activation logic while giving admins a clearer operational layout for fast decisions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
