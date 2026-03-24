import { ActivationExpiredState } from "@/components/slyder/activation-expired-state";
import { ActivationShell } from "@/components/slyder/activation-shell";
import { ActivationStepIndicator } from "@/components/slyder/activation-step-indicator";
import { SlyderActivationForm } from "@/components/slyder/slyder-activation-form";
import { activateSlyder } from "@/modules/slyder-auth/services/slyder-auth.service";

export default async function SlyderActivateTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  try {
    const result = await activateSlyder(token);

    return (
      <ActivationShell
        title="Complete your activation"
        description="Your account has been approved. Set your password first, then sign in to accept the final courier terms and finish setup."
      >
        <ActivationStepIndicator current="activate" />
        <div className="mt-8">
          <SlyderActivationForm token={token} passwordSet={result.passwordSet} />
        </div>
      </ActivationShell>
    );
  } catch (error) {
    return (
      <ActivationShell
        title="Activation unavailable"
        description="This activation link cannot be used right now."
      >
        <ActivationExpiredState message={error instanceof Error ? error.message : "Activation link is invalid or expired."} />
      </ActivationShell>
    );
  }
}
