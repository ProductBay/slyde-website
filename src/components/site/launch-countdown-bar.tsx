"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";

const LAUNCH_DATE = new Date("2026-06-02T00:00:00-05:00");

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  launched: boolean;
};

function getCountdownState(now: Date): CountdownState {
  const diff = LAUNCH_DATE.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      launched: true,
    };
  }

  const totalMinutes = Math.floor(diff / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return {
    days,
    hours,
    minutes,
    launched: false,
  };
}

export function LaunchCountdownBar() {
  const [countdown, setCountdown] = useState<CountdownState>(() => getCountdownState(new Date()));

  useEffect(() => {
    const syncCountdown = () => setCountdown(getCountdownState(new Date()));

    syncCountdown();
    const interval = window.setInterval(syncCountdown, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const launchLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-JM", {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(LAUNCH_DATE),
    [],
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.35rem] border border-slate-200/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(246,249,252,0.24))] shadow-[0_18px_40px_-34px_rgba(15,23,42,0.1)] backdrop-blur-[3px]">
        <div className="flex flex-col gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-orange-200/80 bg-orange-50 text-orange-600 sm:h-8 sm:w-8">
                <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
              <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-orange-700 sm:text-[10px] sm:tracking-[0.22em]">
                Going Live
              </span>
            </div>
            <p className="mt-1.5 text-[13px] font-semibold leading-5 text-slate-950 sm:mt-2 sm:text-[0.95rem]">
              SLYDE officially launches on {launchLabel}
            </p>
            <p className="mt-1 hidden text-xs text-slate-600 sm:block sm:text-[13px]">
              {countdown.launched
                ? "SLYDE launch day is here."
                : "Countdown to the official Jamaica-wide launch."}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:flex-row sm:items-center sm:gap-3 lg:flex-shrink-0">
            <div className="grid flex-1 grid-cols-3 gap-1.5 sm:flex-none sm:gap-2">
              {[
                { label: "Days", value: countdown.days },
                { label: "Hours", value: countdown.hours },
                { label: "Mins", value: countdown.minutes },
              ].map((item) => (
                <div
                  key={item.label}
                  className="min-w-0 rounded-[1rem] border border-slate-200/80 bg-white px-2 py-1.5 text-center shadow-[0_14px_28px_-24px_rgba(15,23,42,0.22)] sm:min-w-[4.35rem] sm:rounded-2xl sm:px-3 sm:py-2"
                >
                  <p className="text-[15px] font-semibold tracking-tight text-slate-950 sm:text-[1.15rem]">
                    {String(item.value).padStart(2, "0")}
                  </p>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-[10px] sm:tracking-[0.18em]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/become-a-slyder/apply"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-slate-950 px-3 text-[13px] font-semibold text-white shadow-[0_16px_30px_-20px_rgba(15,23,42,0.62)] transition hover:-translate-y-0.5 hover:bg-slate-900 sm:h-11 sm:px-4 sm:text-sm"
            >
              <span className="hidden sm:inline">Join before launch</span>
              <span className="sm:hidden">Join</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
