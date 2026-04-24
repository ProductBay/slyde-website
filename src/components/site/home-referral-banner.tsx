"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";

export function HomeReferralBanner() {
  return (
    <section className="section-shell py-6">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,rgba(250,184,66,0.96)_0%,rgba(14,165,233,0.78)_34%,rgba(94,234,212,0.68)_62%,rgba(250,184,66,0.92)_100%)] p-[1px] shadow-[0_28px_90px_rgba(15,23,42,0.2)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,240,200,0.85),transparent_22%),radial-gradient(circle_at_top_right,rgba(125,211,252,0.34),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(74,222,128,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.2),transparent_18%)]" />
        <div className="pointer-events-none absolute inset-[10px] rounded-[2.2rem] border border-white/35" />
        <div className="pointer-events-none absolute inset-[22px] rounded-[1.9rem] border border-black/40" />
        <div className="pointer-events-none absolute left-6 top-6 h-12 w-12 rounded-tl-[1.6rem] border-l border-t border-white/70" />
        <div className="pointer-events-none absolute right-6 top-6 h-12 w-12 rounded-tr-[1.6rem] border-r border-t border-white/55" />
        <div className="pointer-events-none absolute bottom-6 left-6 h-12 w-12 rounded-bl-[1.6rem] border-b border-l border-white/55" />
        <div className="pointer-events-none absolute bottom-6 right-6 h-12 w-12 rounded-br-[1.6rem] border-b border-r border-white/70" />

        <div className="relative overflow-hidden rounded-[2.35rem] bg-[#040816] p-2 sm:p-3 lg:p-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]" />
          <div className="relative overflow-hidden rounded-[1.9rem] border border-white/12 bg-slate-950/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <Image
              src="/images/slyde-referral-banner.png"
              alt="SLYDE referral network banner showing community growth, courier onboarding, and referral rewards across Jamaica."
              width={1792}
              height={1024}
              priority={false}
              className="h-auto w-full object-cover"
              sizes="(min-width: 1280px) 1200px, (min-width: 768px) calc(100vw - 64px), calc(100vw - 24px)"
            />
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/95 px-5 py-5 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700">
                  Slyder-Hook
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Community growth, stronger launch readiness</span>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-[0.95rem]">
                Help grow the SLYDE network with quality courier referrals, cleaner onboarding momentum, and stronger area-by-area readiness across Jamaica.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-shrink-0">
              <LinkButton href="/refer-a-slyder" className="justify-center" icon={<ArrowRight className="h-4 w-4" />}>
                Join as Slyder-Hook
              </LinkButton>
              <LinkButton href="/refer" variant="secondary" className="justify-center">
                Open dashboard
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
