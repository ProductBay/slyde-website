import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Request Received",
  "Your SLYDE residential dispatch request has been received.",
  "/dispatch-from-home/success",
);

export default async function DispatchFromHomeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="section-shell flex min-h-[60vh] items-center py-16">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <p className="eyebrow-badge mx-auto mb-4 border-emerald-100 bg-emerald-50 text-emerald-700">
          Request received
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Your dispatch request is in
        </h1>

        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600">
          We have received your request and are matching it to an available Slyder in your area. You will hear from us
          shortly by WhatsApp or email.
        </p>

        {resolvedSearchParams.ref ? (
          <p className="mt-3 text-sm font-medium text-slate-700">
            Reference: <span className="font-semibold text-slate-950">{resolvedSearchParams.ref}</span>
          </p>
        ) : null}

        <div className="mx-auto mt-8 max-w-sm rounded-[1.5rem] border border-white/50 bg-white/90 px-6 py-5 shadow-panel">
          <p className="text-sm font-medium text-slate-700">What happens next</p>
          <ul className="mt-3 space-y-2 text-left text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">✓</span>
              Your request has been logged and is under review
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">✓</span>
              A verified Slyder will be assigned to your pickup
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">✓</span>
              You will receive a WhatsApp or email confirmation
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">✓</span>
              Pickup will be scheduled based on your urgency selection
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <LinkButton href="/account/residential" variant="secondary">
            Open residential dashboard
          </LinkButton>
          <LinkButton href="/dispatch-from-home" variant="secondary">
            Submit another request
          </LinkButton>
          <LinkButton href="/support" variant="ghost">
            <MessageSquare className="h-4 w-4" />
            Contact support
          </LinkButton>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Questions? Reach us at{" "}
          <a href="/contact" className="underline hover:text-slate-700">
            slyde.contact
          </a>{" "}
          or via WhatsApp.
        </p>
      </div>
    </div>
  );
}
