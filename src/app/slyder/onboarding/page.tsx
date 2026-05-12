import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, Circle, Clock3, FileCheck2, Gauge, Lock, PackageCheck, ShieldCheck, Smartphone, UserCheck } from "lucide-react";
import { ActivationShell } from "@/components/slyder/activation-shell";
import { ActivationStepIndicator } from "@/components/slyder/activation-step-indicator";
import { EligibilityStatusBanner } from "@/components/slyder/eligibility-status-banner";
import { ResendInvitePanel } from "@/components/slyder/resend-invite-panel";
import { SlyderApprovalModal } from "@/components/slyder/slyder-approval-modal";
import { SlyderPreparationChecklist } from "@/components/slyder/slyder-preparation-checklist";
import { ZoneStatusPanel } from "@/components/slyder/zone-status-panel";
import { getSessionContext } from "@/server/auth/session";
import { getSlyderOnboardingStatus } from "@/modules/slyder-auth/services/slyder-onboarding.service";

type SlyderOnboardingStatus = Awaited<ReturnType<typeof getSlyderOnboardingStatus>>;

function formatStatus(value?: string) {
  if (!value) return "Pending";
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) return "Not recorded yet";
  return new Intl.DateTimeFormat("en-JM", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function getNextAction(status: SlyderOnboardingStatus) {
  if (!status.activationCompleted) return { href: "/slyder/login", label: "Activate app access" };
  if (!status.contractAccepted || (status.pendingLegalDocuments?.length ?? 0) > 0) return { href: "/slyder/onboarding/legal", label: "Accept legal terms" };
  if (!status.profileComplete || !status.permissionsComplete || !status.payoutSetupComplete) return { href: "/slyder/onboarding/setup", label: "Finish setup" };
  if (status.readinessChecklist.overallStatus !== "passed") return { href: "/slyder/onboarding/readiness", label: "Complete readiness" };
  return { href: "/slyder/onboarding/complete", label: "Review completion" };
}

function getCurrentStep(status: SlyderOnboardingStatus) {
  if (!status.activationCompleted) return "activate" as const;
  if (!status.contractAccepted || (status.pendingLegalDocuments?.length ?? 0) > 0) return "legal" as const;
  if (!status.profileComplete || !status.permissionsComplete || !status.payoutSetupComplete) return "setup" as const;
  if (status.readinessChecklist.overallStatus !== "passed") return "readiness" as const;
  return "complete" as const;
}

function buildLifecycle(status: SlyderOnboardingStatus) {
  return [
    {
      label: "Application submitted",
      detail: status.applicationCode ? `Application ${status.applicationCode}` : "Your application record is saved.",
      complete: true,
      icon: FileCheck2,
    },
    {
      label: "Admin decision",
      detail: status.applicationStatus === "approved" ? "SLYDE admin approved you for onboarding." : `Current admin status: ${formatStatus(status.applicationStatus)}`,
      complete: status.applicationStatus === "approved",
      icon: UserCheck,
    },
    {
      label: "Slyder app access",
      detail: status.activationCompleted ? "Your approved access is activated." : "After approval, SLYDE sends access so you can create your password.",
      complete: status.activationCompleted,
      icon: Smartphone,
    },
    {
      label: "Legal acceptance",
      detail: status.contractAccepted && (status.pendingLegalDocuments?.length ?? 0) === 0 ? "Current courier terms are accepted." : "Final courier terms still need acceptance.",
      complete: status.contractAccepted && (status.pendingLegalDocuments?.length ?? 0) === 0,
      icon: ShieldCheck,
    },
    {
      label: "Setup details",
      detail: status.profileComplete && status.permissionsComplete && status.payoutSetupComplete ? "Profile, permissions, and payout setup are complete." : "Profile, permissions, payout, or vehicle details still need attention.",
      complete: status.profileComplete && status.permissionsComplete && status.payoutSetupComplete,
      icon: PackageCheck,
    },
    {
      label: "GLYDE readiness",
      detail: status.readinessChecklist.overallStatus === "passed" ? "You are ready for SLYDE to evaluate GLYDE delivery eligibility." : "Complete readiness before GLYDE delivery eligibility can be evaluated.",
      complete: status.readinessChecklist.overallStatus === "passed",
      icon: Gauge,
    },
  ];
}

function DashboardStat({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "sky" | "emerald" | "amber" }) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-950",
    sky: "border-sky-100 bg-sky-50 text-sky-900",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-900",
    amber: "border-amber-100 bg-amber-50 text-amber-900",
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{label}</p>
      <p className="mt-2 text-base font-semibold">{value}</p>
    </div>
  );
}

export default async function SlyderOnboardingIndexPage() {
  const session = await getSessionContext();
  if (!session || !session.user.roles.includes("slyder")) redirect("/slyder/login");

  const status = await getSlyderOnboardingStatus(session.user.id);
  const nextAction = getNextAction(status);
  const lifecycle = buildLifecycle(status);
  const completed = lifecycle.filter((step) => step.complete).length;
  const progressPercent = Math.round((completed / lifecycle.length) * 100);
  const currentStep = getCurrentStep(status);
  const isReady = status.eligibilityState === "eligible_online" || status.eligibilityState === "eligible_offline";

  return (
    <>
    <SlyderApprovalModal applicationCode={status.applicationCode} displayName={status.displayName} isApproved={status.applicationStatus === "approved"} />
    <ActivationShell
      title="Slyder onboarding dashboard"
      description="Track your submitted application, SLYDE admin action, Slyder app access, final onboarding, and GLYDE readiness from one place."
    >
      <ActivationStepIndicator current={currentStep} />

      <div className="mt-8 grid gap-6">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Application lifecycle</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{completed} of {lifecycle.length} stages complete</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Your dashboard updates as SLYDE reviews your application, creates approved app access, and receives your final onboarding confirmations.
              </p>
            </div>
            <Link
              href={nextAction.href}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
            >
              {nextAction.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {lifecycle.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className={`rounded-2xl border p-4 ${step.complete ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-start gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${step.complete ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-500"}`}>
                      {step.complete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{step.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{step.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardStat label="Application" value={formatStatus(status.applicationStatus)} tone={status.applicationStatus === "approved" ? "emerald" : "amber"} />
          <DashboardStat label="Account" value={formatStatus(status.accountStatus)} tone={status.activationCompleted ? "emerald" : "sky"} />
          <DashboardStat label="Onboarding" value={formatStatus(status.onboardingStatus)} tone={isReady ? "emerald" : "sky"} />
          <DashboardStat label="Operations" value={formatStatus(status.operationalStatus)} tone={status.canReceiveOrders ? "emerald" : "slate"} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.56fr)_minmax(0,0.44fr)]">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <Clock3 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Admin action</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-950">SLYDE review and access status</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Submitted {formatDate(status.applicationSubmittedAt)}. Reviewed {formatDate(status.applicationReviewedAt)}.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Application code</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">{status.applicationCode || "Pending"}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Zone</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">{status.zoneName || "Pending assignment"}</p>
                  </div>
                </div>
                {status.applicationRequestedDocumentNotes ? (
                  <p className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                    SLYDE requested more information: {status.applicationRequestedDocumentNotes}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-950 bg-slate-950 p-5 text-white shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
                {status.activationCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">Slyder app access</p>
                <h2 className="mt-2 text-lg font-semibold">{status.activationCompleted ? "Access is active" : "Access is created after approval"}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Once SLYDE approves your application, you receive app access to create your password and complete final onboarding before GLYDE delivery eligibility is evaluated.
                </p>
                <Link href="https://app.slydenetwork.com" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-200 hover:text-white">
                  Open Slyder app sign in
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <EligibilityStatusBanner eligibilityState={status.eligibilityState} zoneName={status.zoneName} />
        <ZoneStatusPanel zoneName={status.zoneName} zoneStatus={status.zoneStatus} />

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Required SLYDE checklist</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">What must be complete before delivery eligibility</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Legal accepted", status.contractAccepted && (status.pendingLegalDocuments?.length ?? 0) === 0],
              ["Profile confirmed", status.profileComplete],
              ["Vehicle or courier details confirmed", status.vehicleVerified],
              ["Payout setup complete", status.payoutSetupComplete],
              ["Permissions confirmed", status.permissionsComplete],
              ["Emergency contact confirmed", status.readinessChecklist.emergencyContactConfirmed],
              ["Training acknowledged", status.readinessChecklist.trainingAcknowledged],
              ["Readiness passed", status.readinessChecklist.overallStatus === "passed"],
            ].map(([label, complete]) => (
              <div key={String(label)} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                {complete ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-slate-400" />}
                <span className="text-sm font-semibold text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <SlyderPreparationChecklist />
        <ResendInvitePanel allowStatusUpdate />
      </div>
    </ActivationShell>
    </>
  );
}

