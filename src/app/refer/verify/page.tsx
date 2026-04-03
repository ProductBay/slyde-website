import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReferrerVerifyForm } from "@/components/site/referrer-verify-form";
import { buildMetadata } from "@/lib/metadata";
import { getReferrerSessionContext } from "@/server/auth/referrer-session";

export const metadata: Metadata = buildMetadata(
  "Verify Referrer Login",
  "Enter your one-time email code to finish signing in to the SLYDE referrer dashboard.",
  "/refer/verify",
);

export default async function ReferrerVerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getReferrerSessionContext();
  if (session) {
    redirect("/refer/dashboard");
  }

  const params = await searchParams;
  const challenge = typeof params.challenge === "string" ? params.challenge : undefined;
  const email = typeof params.email === "string" ? params.email : undefined;

  return (
    <section className="section-shell py-12">
      <ReferrerVerifyForm initialChallengeId={challenge} initialEmail={email} />
    </section>
  );
}
