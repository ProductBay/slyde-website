import Link from "next/link";
import { redirect } from "next/navigation";
import { ActivationShell } from "@/components/slyder/activation-shell";
import { ActivationStepIndicator } from "@/components/slyder/activation-step-indicator";
import { getSessionContext } from "@/server/auth/session";
import { getSlyderOnboardingStatus } from "@/modules/slyder-auth/services/slyder-onboarding.service";

function getNextAction(status: Awaited<ReturnType<typeof getSlyderOnboardingStatus>>) {
  if (!status.activationCompleted) {
    return { href: "/slyder/login", label: "Return to sign in" };
  }

  if (!status.contractAccepted || (status.pendingLegalDocuments?.length ?? 0) > 0) {
    return { href: "/slyder/onboarding/legal", label: "Accept legal terms" };
  }

  if (!status.profileComplete || !status.permissionsComplete || !status.payoutSetupComplete) {
    return { href: "/slyder/onboarding/setup", label: "Continue setup" };
  }

  if (status.readinessChecklist.overallStatus !== "passed") {
    return { href: "/slyder/onboarding/readiness", label: "Complete readiness" };
  }

  return { href: "/slyder/onboarding/complete", label: "View onboarding status" };
}

export default async function SlyderOnboardingWelcomePage() {
  const session = await getSessionContext();
  if (!session || !session.user.roles.includes("slyder")) redirect("/slyder/login");

  const status = await getSlyderOnboardingStatus(session.user.id);
  if (!status.activationCompleted) redirect("/slyder/login");

  const nextAction = getNextAction(status);

  return (
    <ActivationShell
      title="You're Approved, Activated, and In"
      description="Your SLYDE account access is confirmed. Before you can work on the SLYDE network, you still need to complete the remaining onboarding flow and wait for operational eligibility."
    >
      <ActivationStepIndicator current="activate" />
      <div className="mt-8 grid gap-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-[radial-gradient(circle_at_top,#ecfdf5_0%,#f8fffb_46%,#ffffff_100%)] p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-8 top-8 h-3 w-3 rotate-12 rounded-sm bg-amber-300/80" />
            <div className="absolute left-20 top-12 h-2.5 w-2.5 rounded-full bg-sky-300/80" />
            <div className="absolute right-16 top-10 h-3 w-3 -rotate-12 rounded-sm bg-emerald-300/80" />
            <div className="absolute right-28 top-20 h-2.5 w-2.5 rounded-full bg-rose-300/80" />
            <div className="absolute left-14 bottom-12 h-3 w-3 rotate-45 rounded-sm bg-violet-300/70" />
            <div className="absolute right-12 bottom-10 h-2.5 w-2.5 rounded-full bg-amber-300/70" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Congratulations</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Welcome to the SLYDE onboarding flow
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            Your admin approval is complete, your activation is confirmed, and your Slyder account is now live for onboarding.
            You can use your approved email or phone number together with the password you just set whenever you sign in again.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-950">1. Finish onboarding on the website</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Complete the remaining legal, setup, and readiness steps here on the SLYDE website.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-950">2. Watch for document and zone updates</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                SLYDE will review your documents, confirm your onboarding state, and notify you when your zone is ready.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-950">3. Access the SLYDE app with the same credentials</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Once your onboarding is complete and your account is operationally cleared, use the same approved sign-in details to access the SLYDE app.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={nextAction.href}
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-glow transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
            >
              {nextAction.label}
            </Link>
            <Link
              href="/slyder/onboarding/complete"
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
            >
              View status summary
            </Link>
          </div>
        </div>
      </div>
    </ActivationShell>
  );
}
