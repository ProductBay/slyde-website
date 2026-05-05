import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
    <div className="relative min-h-[72vh]">
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
      </div>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-7 text-center shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700">Dispatch From Home</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Coming soon</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            This service is not live yet. We are finalizing launch-readiness and will open this flow soon.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dispatch-from-home"
              className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to overview
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Explore site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
