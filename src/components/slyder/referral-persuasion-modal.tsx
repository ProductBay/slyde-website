"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Gift, Zap } from "lucide-react";

export function ReferralPersuasionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  function handleProceedToReferral() {
    onClose();
    router.push("/refer");
  }

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end bg-slate-950/60 sm:items-center sm:justify-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-t-[1.5rem] bg-white shadow-2xl sm:rounded-[1.5rem]"
        style={{ maxHeight: "min(92dvh, 92vh)" }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-slate-950">Expand Your Network</p>
            <p className="text-xs text-slate-500">Start earning through referrals</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close referral modal"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          <div className="space-y-6">
            {/* Main headline */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Start earning more with referrals
              </h2>
              <p className="mt-2 text-base leading-7 text-slate-600">
                Share your unique referral link and earn rewards every time a friend joins SLYDE as a Slyder. Build your network, expand your earnings.
              </p>
            </div>

            {/* Benefits grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-sky-100 bg-sky-50/50 p-4">
                <div className="flex items-start gap-3">
                  <Gift className="mt-1 h-5 w-5 shrink-0 text-sky-600" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sky-950">Earn Rewards</p>
                    <p className="mt-1 text-sm text-sky-900/70">
                      Get bonuses when your referrals complete signup and onboarding.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="flex items-start gap-3">
                  <Zap className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
                  <div className="min-w-0">
                    <p className="font-semibold text-emerald-950">Easy Sharing</p>
                    <p className="mt-1 text-sm text-emerald-900/70">
                      Copy your link and share it with friends on WhatsApp, SMS, or socials.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social proof */}
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Slyders are building networks
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                1,000+ Slyders earning through referrals
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Join a growing community of Slyders expanding their income streams.
              </p>
            </div>

            {/* How it works */}
            <div>
              <p className="text-sm font-semibold text-slate-950">How it works</p>
              <ol className="mt-3 space-y-2">
                <li className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                    1
                  </span>
                  <span>Copy your unique referral link from your dashboard</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                    2
                  </span>
                  <span>Share it with friends interested in delivering with SLYDE</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                    3
                  </span>
                  <span>Earn rewards when they complete their onboarding</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleProceedToReferral}
              className="flex items-center justify-center gap-2 rounded-[0.9rem] bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:flex-1"
            >
              Start Referring & Earning
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[0.9rem] border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-1"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
