"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, X } from "lucide-react";

const slydeAppUrl = "https://app.slydenetwork.com";
const approvalModalVersion = "v2-glyde";

export function SlyderApprovalModal({
  applicationCode,
  displayName,
  isApproved,
}: {
  applicationCode?: string;
  displayName: string;
  isApproved: boolean;
}) {
  const [open, setOpen] = useState(false);
  const storageKey = useMemo(
    () => `slyde:slyder-approval-modal:${approvalModalVersion}:${applicationCode || "current"}`,
    [applicationCode],
  );

  useEffect(() => {
    if (!isApproved) return;

    try {
      if (window.localStorage.getItem(storageKey) === "dismissed") return;
    } catch {
      // If storage is unavailable, still show the approval notice for this visit.
    }

    setOpen(true);
  }, [isApproved, storageKey]);

  function dismiss() {
    try {
      window.localStorage.setItem(storageKey, "dismissed");
    } catch {
      // Dismissal persistence is a browser convenience.
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-slate-950/75 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="slyder-approval-modal-title"
    >
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/20 bg-white shadow-2xl lg:grid-cols-[0.92fr_1.08fr]">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/70 text-white transition hover:bg-slate-950"
          aria-label="Close approval notice"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative min-h-[20rem] overflow-hidden bg-slate-950 text-white lg:min-h-full">
          <img
            src="/images/glyde-whatsapp-cta.png"
            alt="GLYDE SLYDE courier assistant holding a package and WhatsApp icon"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-95"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.22)_48%,rgba(2,6,23,0.82)_100%)]" />
          <div className="relative z-10 flex h-full min-h-[20rem] flex-col justify-between p-6 sm:p-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              Verified approval
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-100">GLYDE readiness path</p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-100">
                Your SLYDE approval unlocks the app-based onboarding path that prepares you for future GLYDE delivery eligibility.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8 lg:py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Application approved</p>
          <h2 id="slyder-approval-modal-title" className="mt-2 max-w-md text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Congratulations{displayName ? `, ${displayName.split(" ")[0]}` : ""}. You are approved for SLYDE onboarding.
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            SLYDE has approved your application. Your next step is to open the SLYDE app, create or use your Slyder access, and complete the final onboarding items before GLYDE delivery eligibility can be evaluated.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Approved path</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">Application {applicationCode || "approved"}</p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Next step</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">Finish in the SLYDE app</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">What happens now</p>
            <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-700">
              <div className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <span>Open the SLYDE app and finish the final onboarding steps.</span>
              </div>
              <div className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                <span>SLYDE will evaluate GLYDE delivery eligibility after your setup and readiness items are complete.</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={slydeAppUrl}
              onClick={dismiss}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
            >
              Open Slyder app
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Stay on dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

