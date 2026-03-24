import Link from "next/link";
import { ActivationShell } from "@/components/slyder/activation-shell";

export default function SlyderActivatePage() {
  return (
    <ActivationShell
      title="Open your activation invite"
      description="Approved Slyders receive activation access by email or WhatsApp. Use the activation link from that message to create your password and begin the final onboarding journey."
    >
      <div className="rounded-[1.75rem] border border-slate-200 bg-surface-1 p-6">
        <p className="text-sm leading-7 text-slate-600">
          If you already completed activation, continue to the Slyder sign-in page to finish the legal, setup, and readiness steps.
        </p>
        <div className="mt-4">
          <Link href="/slyder/login" className="text-sm font-semibold text-sky-700">
            Go to Slyder sign in
          </Link>
        </div>
      </div>
    </ActivationShell>
  );
}
