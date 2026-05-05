import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { Bell } from "lucide-react";

export const metadata: Metadata = buildMetadata(
  "Join the SLYDE Waitlist",
  "Not quite ready yet? Join the SLYDE waitlist and we'll keep you updated on WhatsApp when your zone launches.",
  "/join/slyder/waitlist",
);

export default function JoinSlyderWaitlistPage() {
  return (
    <section className="section-shell py-16 sm:py-20">
      <div className="mx-auto max-w-reading text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
            <Bell className="h-8 w-8" />
          </div>
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950">
          We&apos;ll Keep You Updated
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Not quite ready right now? No problem. Reserve your spot anyway and we&apos;ll send you updates on WhatsApp when your zone moves closer to launch.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/join/slyder"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition duration-200 hover:-translate-y-0.5"
          >
            Keep Me Updated on WhatsApp
          </Link>
          <Link
            href="/become-a-slyder"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition duration-200 hover:-translate-y-0.5"
          >
            Learn More About SLYDE
          </Link>
        </div>
        <p className="mt-6 text-sm text-slate-500">
          No documents or commitments required. Just your basic contact details so we can reach you.
        </p>
      </div>
    </section>
  );
}
