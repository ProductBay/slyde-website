"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/site/brand-mark";

export function ActivationShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef4f8_0%,#f9fbfd_100%)] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Slyder Activation</p>
              <p className="text-sm text-slate-500">Post-approval setup and readiness flow</p>
            </div>
          </div>
          <Link href="/slyder/login" className="text-sm font-semibold text-sky-700">
            Slyder sign in
          </Link>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.72fr)_minmax(22rem,0.28fr)]">
          <div className="surface-panel p-6 sm:p-8">
            <p className="eyebrow-badge border-sky-100 bg-sky-50 text-sky-700">Structured onboarding</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
            <div className="mt-8">{children}</div>
          </div>

          <aside className="space-y-6">
            <div className="dark-panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">Activation flow</p>
              <ol className="mt-4 grid gap-3 text-sm leading-7 text-slate-300">
                <li>1. Verify your approved access.</li>
                <li>2. Accept the final courier terms.</li>
                <li>3. Finish setup and confirm your details.</li>
                <li>4. Complete readiness and training acknowledgement.</li>
                <li>5. Let SLYDE evaluate your operational eligibility.</li>
              </ol>
            </div>

            <div className="surface-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Important</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Approval does not automatically mean you can begin work. Your account must be activated, your legal acceptance must be current, and your zone must be live before SLYDE can enable you for deliveries.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
