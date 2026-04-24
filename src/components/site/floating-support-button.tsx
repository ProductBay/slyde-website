"use client";

import Link from "next/link";
import { LifeBuoy } from "lucide-react";

export function FloatingSupportButton() {
  return (
    <div className="pointer-events-none fixed right-3 top-1/2 z-40 -translate-y-1/2 sm:right-4">
      <Link
        href="/support"
        aria-label="Open support"
        className="group pointer-events-auto relative inline-flex flex-col items-center gap-1.5 rounded-[1.25rem] border border-sky-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(241,247,252,0.92))] px-2.5 py-2.5 text-sky-700 shadow-[0_18px_38px_-24px_rgba(15,23,42,0.34)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:text-slate-950"
      >
        <span className="relative inline-flex h-8 w-8 items-center justify-center">
          <span className="pointer-events-none absolute inset-[-7px] rounded-full border border-sky-300/55 opacity-75 animate-[supportPulse_2.2s_ease-out_infinite]" />
          <span className="pointer-events-none absolute inset-[-12px] rounded-full border border-cyan-200/35 opacity-55 animate-[supportPulse_2.2s_ease-out_infinite_0.6s]" />
          <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.18),transparent_60%)] opacity-90 transition duration-300 group-hover:opacity-100" />
          <LifeBuoy className="relative z-10 h-5 w-5" />
        </span>
        <span className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 transition duration-300 group-hover:text-slate-950">
          Support
        </span>
      </Link>

      <style jsx>{`
        @keyframes supportPulse {
          0% {
            transform: scale(0.9);
            opacity: 0.75;
          }
          70% {
            transform: scale(1.12);
            opacity: 0;
          }
          100% {
            transform: scale(1.12);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
