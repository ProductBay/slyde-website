import type { Metadata, Viewport } from "next";
import { ActivationShell } from "@/components/slyder/activation-shell";
import { ActivationStepIndicator } from "@/components/slyder/activation-step-indicator";
import { SlyderLoginForm } from "@/components/slyder/slyder-login-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...buildMetadata(
    "Slyder Login",
    "Sign in to the SLYDE Slyder portal for onboarding, setup, readiness, and account access.",
    "/slyder/login",
  ),
  manifest: "/slyder/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SLYDE Slyder",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#081223",
};

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
