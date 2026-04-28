import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ResidentialDispatchIntakeForm } from "@/components/residential/dispatch-intake-form";
import { buildMetadata } from "@/lib/metadata";
import { getSessionContext } from "@/server/auth/session";

export const metadata: Metadata = buildMetadata(
  "Start a Dispatch Request",
  "Submit your residential delivery request. A verified SLYDE courier will collect your parcel from home.",
  "/dispatch-from-home/start",
);

export default async function DispatchFromHomeStartPage() {
  const session = await getSessionContext();
  if (!session?.user?.isEnabled) {
    redirect("/login?next=/dispatch-from-home/start");
  }

  return (
    <div className="section-shell py-10 sm:py-14">
      <div className="mb-8">
        <Link
          href="/dispatch-from-home"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dispatch from Home
        </Link>
      </div>

      <div className="mb-8 space-y-3">
        <p className="eyebrow-badge border-sky-100 bg-sky-50 text-sky-700">Residential dispatch</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Submit your dispatch request
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          Fill in the four steps below. Once submitted, we will match your request to a verified Slyder in your area
          and confirm the pickup details with you.
        </p>
      </div>

      <div className="max-w-2xl">
        <ResidentialDispatchIntakeForm
          identity={{
            fullName: session.user.fullName,
            phone: session.user.phone,
            email: session.user.email,
          }}
        />
      </div>

      <p className="mt-6 max-w-xl text-xs leading-6 text-slate-400">
        By submitting this form you agree to the SLYDE{" "}
        <Link href="/privacy" className="underline hover:text-slate-700">
          Privacy Notice
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="underline hover:text-slate-700">
          Terms of Use
        </Link>
        . Residential dispatching is account-based and cash-free for security. Confirmation is sent after payment
        verification and assignment.
      </p>
    </div>
  );
}
