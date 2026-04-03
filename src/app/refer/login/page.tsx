import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReferrerLoginForm } from "@/components/site/referrer-login-form";
import { buildMetadata } from "@/lib/metadata";
import { getReferrerSessionContext } from "@/server/auth/referrer-session";

export const metadata: Metadata = buildMetadata(
  "Referrer Login",
  "Request a one-time email code to access the authenticated SLYDE referrer dashboard.",
  "/refer/login",
);

export default async function ReferrerLoginPage() {
  const session = await getReferrerSessionContext();
  if (session) {
    redirect("/refer/dashboard");
  }

  return (
    <section className="section-shell py-12">
      <ReferrerLoginForm />
    </section>
  );
}
