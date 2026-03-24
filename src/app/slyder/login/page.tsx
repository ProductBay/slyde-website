import { ActivationShell } from "@/components/slyder/activation-shell";
import { ActivationStepIndicator } from "@/components/slyder/activation-step-indicator";
import { SlyderLoginForm } from "@/components/slyder/slyder-login-form";

export default function SlyderLoginPage() {
  return (
    <ActivationShell
      title="Sign in to continue onboarding"
      description="Approved Slyders must sign in, complete final legal acceptance, finish setup, and pass readiness before SLYDE can enable them for operations."
    >
      <ActivationStepIndicator current="activate" />
      <div className="mt-8">
        <SlyderLoginForm />
      </div>
    </ActivationShell>
  );
}
