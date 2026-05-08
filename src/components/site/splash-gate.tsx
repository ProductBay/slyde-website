"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Compass,
  MapPin,
  MessageCircle,
  Package,
  UserRoundPlus,
  Zap,
} from "lucide-react";

type Phase = "splash" | "modal" | "exit";

const STORAGE_KEY = "slyde_splash_v1";

const SLYDER_SPOT_COUNT = 243;
const SLYDER_SPOT_TOTAL = 500;
const SLYDER_PCT = Math.round((SLYDER_SPOT_COUNT / SLYDER_SPOT_TOTAL) * 100);

const FEATURED = [
  {
    id: "slyder",
    title: "Become a Founding Slyder",
    sub: "Founding spots open",
    description:
      "Join the first wave of SLYDE couriers and reserve your activation spot before public launch. Set your own hours and work your area.",
    href: "/join/slyder",
    icon: UserRoundPlus,
    card: "from-sky-500/25 via-cyan-500/12 to-transparent",
    badge: "bg-sky-500/20 text-sky-300 border border-sky-400/35",
    iconRing: "bg-sky-500/20 text-sky-300",
    border: "border-sky-400/35 hover:border-sky-400/60",
    cta: "Reserve My Spot",
    infoCta: "Learn More",
    infoHref: "/become-a-slyder",
  },
  {
    id: "business",
    title: "Become a Founding Merchant",
    sub: "Early merchant access",
    description:
      "Get priority onboarding and launch benefits for your business before the SLYDE network opens publicly. No commitment required yet.",
    href: "/join/merchant",
    icon: BriefcaseBusiness,
    card: "from-emerald-500/25 via-teal-500/12 to-transparent",
    badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/35",
    iconRing: "bg-emerald-500/20 text-emerald-300",
    border: "border-emerald-400/35 hover:border-emerald-400/60",
    cta: "Register My Business",
    infoCta: "View Business Benefits",
    infoHref: "/for-businesses",
  },
];

const SECONDARY = [
  {
    id: "track",
    title: "Track a Delivery",
    description: "Follow your package in real time from dispatch to doorstep.",
    href: "/contact",
    icon: Package,
    card: "from-violet-500/15 to-transparent",
    iconRing: "bg-violet-500/20 text-violet-300",
    border: "border-violet-400/25 hover:border-violet-400/50",
    cta: "Get Help",
    disabled: false,
  },
  {
    id: "refer",
    title: "Refer a Slyder",
    description: "Earn referral rewards when you grow the network.",
    href: "/refer-a-slyder",
    icon: Zap,
    card: "from-amber-500/15 to-transparent",
    iconRing: "bg-amber-500/20 text-amber-300",
    border: "border-amber-400/25 hover:border-amber-400/50",
    cta: "Refer now",
  },
  {
    id: "dispatch",
    title: "Dispatch from Home",
    description: "Coordinate and manage deliveries remotely.",
    href: "/dispatch-from-home",
    icon: MapPin,
    card: "from-rose-500/15 to-transparent",
    iconRing: "bg-rose-500/20 text-rose-300",
    border: "border-rose-400/25 hover:border-rose-400/50",
    cta: "Learn more",
  },
  {
    id: "support",
    title: "Get Support",
    description: "Reach the SLYDE operations team for help.",
    href: "/contact",
    icon: MessageCircle,
    card: "from-slate-500/15 to-transparent",
    iconRing: "bg-slate-500/20 text-slate-300",
    border: "border-slate-500/30 hover:border-slate-400/50",
    cta: "Contact us",
  },
];

export function SplashGate() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("splash");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on the homepage — never intercept direct deep-links or external referrals
    if (pathname !== "/") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    setVisible(true);
    document.body.style.overflow = "hidden";

    const t = setTimeout(() => setPhase("modal"), 2900);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setPhase("exit");
    document.body.style.overflow = "";
    sessionStorage.setItem(STORAGE_KEY, "1");
    setTimeout(() => setVisible(false), 580);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes sg-logo-in {
          0%   { opacity:0; transform:scale(0.65); filter:drop-shadow(0 0 0px rgba(0,132,194,0)); }
          65%  { opacity:1; transform:scale(1.07); filter:drop-shadow(0 0 38px rgba(0,132,194,0.55)); }
          100% { opacity:1; transform:scale(1);    filter:drop-shadow(0 0 22px rgba(0,132,194,0.38)); }
        }
        @keyframes sg-breathe {
          0%,100% { filter:drop-shadow(0 0 22px rgba(0,132,194,0.38)); }
          50%      { filter:drop-shadow(0 0 50px rgba(0,132,194,0.70)); }
        }
        @keyframes sg-glide-in {
          0%   { opacity:0; transform:translateY(28px) scale(0.78); filter:drop-shadow(0 0 0 rgba(34,197,94,0)); }
          62%  { opacity:1; transform:translateY(-4px) scale(1.04); filter:drop-shadow(0 28px 46px rgba(34,197,94,0.22)); }
          100% { opacity:1; transform:translateY(0) scale(1); filter:drop-shadow(0 24px 40px rgba(14,165,233,0.25)); }
        }
        @keyframes sg-glide-hover {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-10px); }
        }
        @keyframes sg-glide-aura {
          0%,100% { opacity:0.34; transform:scale(0.92); }
          50%     { opacity:0.72; transform:scale(1.08); }
        }
        @keyframes sg-ring1 {
          0%   { transform:scale(0.82); opacity:0.65; }
          100% { transform:scale(1.85); opacity:0; }
        }
        @keyframes sg-ring2 {
          0%   { transform:scale(0.82); opacity:0.45; }
          100% { transform:scale(2.4);  opacity:0; }
        }
        @keyframes sg-tagline {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes sg-progress {
          from { width:0%; }
          to   { width:100%; }
        }
        @keyframes sg-skip {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes sg-float-a {
          0%,100% { transform:translate(0,0); }
          40%     { transform:translate(22px,-28px); }
          70%     { transform:translate(-14px,-16px); }
        }
        @keyframes sg-float-b {
          0%,100% { transform:translate(0,0); }
          35%     { transform:translate(-24px,20px); }
          65%     { transform:translate(16px,24px); }
        }
        @keyframes sg-float-c {
          0%,100% { transform:translate(0,0); }
          50%     { transform:translate(10px,-18px); }
        }
        @keyframes sg-modal-up {
          from { opacity:0; transform:translateY(52px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes sg-card-in {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes sg-fade-out {
          from { opacity:1; }
          to   { opacity:0; }
        }
        @keyframes sg-particle {
          0%,100% { opacity:0.25; transform:translateY(0); }
          50%      { opacity:0.7;  transform:translateY(-12px); }
        }
      `}</style>

      {/* Root overlay */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to SLYDE"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-y-auto bg-[#050c18] p-3 sm:p-4"
        style={{
          animation: phase === "exit" ? "sg-fade-out 0.56s ease forwards" : "none",
        }}
      >
        {/* ── Ambient gradient blobs ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute left-[6%] top-[10%] h-72 w-72 rounded-full bg-sky-600/10 blur-[88px]"
            style={{ animation: "sg-float-a 10s ease-in-out infinite" }}
          />
          <div
            className="absolute bottom-[10%] right-[6%] h-80 w-80 rounded-full bg-cyan-500/8 blur-[96px]"
            style={{ animation: "sg-float-b 12s ease-in-out infinite" }}
          />
          <div
            className="absolute left-1/2 top-[45%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-900/18 blur-[130px]"
            style={{ animation: "sg-float-c 14s ease-in-out infinite" }}
          />
          {/* Subtle grid lines */}
          <div
            className="absolute inset-0 opacity-[0.028]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,210,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,210,246,1) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        {/* ── SPLASH PHASE ── */}
        <div
          className="relative flex w-full max-w-5xl flex-col items-center px-4 py-6 sm:grid sm:grid-cols-[1fr_auto] sm:items-center sm:gap-10"
          style={{
            opacity: phase !== "splash" ? 0 : 1,
            transform: phase !== "splash" ? "scale(0.9) translateY(-24px)" : "scale(1)",
            transition: "opacity 0.45s ease, transform 0.45s ease",
            pointerEvents: phase === "splash" ? "auto" : "none",
            position: phase !== "splash" ? "absolute" : "relative",
          }}
        >
          {/* Pulse rings */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
            <div
              className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-400/22"
              style={{ animation: "sg-ring1 2.6s ease-out infinite" }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-400/14"
              style={{ animation: "sg-ring2 2.6s ease-out 0.9s infinite" }}
            />
          </div>

          {/* Floating particles */}
          <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
            {[
              { top: "-60px", left: "-80px", delay: "0s", size: "5px" },
              { top: "20px", left: "160px", delay: "0.6s", size: "4px" },
              { top: "90px", left: "-100px", delay: "1.2s", size: "3px" },
              { top: "-40px", left: "200px", delay: "0.3s", size: "5px" },
              { top: "140px", left: "120px", delay: "0.9s", size: "3px" },
            ].map((p, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-sky-400"
                style={{
                  top: p.top,
                  left: p.left,
                  width: p.size,
                  height: p.size,
                  animation: `sg-particle ${2.4 + i * 0.4}s ease-in-out ${p.delay} infinite`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center sm:items-start">
            {/* Logo */}
            <div
              style={{
                animation: "sg-logo-in 1.15s cubic-bezier(0.22,1,0.36,1) forwards, sg-breathe 3.2s ease-in-out 1.3s infinite",
              }}
            >
              <Image
                src="/images/slyde-logo.png"
                alt="SLYDE Logistics"
                width={240}
                height={170}
                priority
                className="block brightness-0 invert"
              />
            </div>

            {/* Tagline */}
            <p
              className="mt-5 text-center text-[11px] font-bold uppercase tracking-[0.36em] text-sky-400/75 sm:text-left"
              style={{ animation: "sg-tagline 0.7s ease 1.1s both" }}
            >
              Jamaica-first logistics network
            </p>

            <div
              className="mt-4 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-center text-xs font-semibold text-slate-200 shadow-[0_18px_45px_-28px_rgba(14,165,233,0.7)] backdrop-blur sm:text-left"
              style={{ animation: "sg-tagline 0.7s ease 1.35s both" }}
            >
              Glide is ready to help you join the network.
            </div>

            {/* Progress bar */}
            <div className="mt-8 h-[2px] w-44 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                style={{ animation: "sg-progress 2.7s linear 0.25s both" }}
              />
            </div>

            {/* Skip hint */}
            <button
              onClick={dismiss}
              className="mt-6 text-[11px] font-medium text-slate-500 transition hover:text-slate-300"
              style={{ animation: "sg-skip 0.6s ease 1.8s both" }}
            >
              Skip intro
            </button>
          </div>

          <div
            className="relative z-10 mt-6 h-64 w-56 sm:mt-0 sm:h-[360px] sm:w-[310px] lg:h-[390px] lg:w-[330px]"
            style={{ animation: "sg-glide-in 1.05s cubic-bezier(0.22,1,0.36,1) 0.35s both" }}
            aria-hidden="true"
          >
            <div
              className="absolute inset-x-7 bottom-5 h-24 rounded-full bg-green-400/20 blur-3xl"
              style={{ animation: "sg-glide-aura 2.8s ease-in-out 1.2s infinite" }}
            />
            <div style={{ animation: "sg-glide-hover 3.6s ease-in-out 1.4s infinite" }}>
              <Image
                src="/images/glide-whatsapp-cta.png"
                alt=""
                width={430}
                height={560}
                priority
                className="h-full w-full object-cover object-[50%_20%]"
              />
            </div>
            <div className="absolute bottom-6 right-1 rounded-full border border-green-300/40 bg-green-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_12px_26px_-12px_rgba(34,197,94,0.9)] sm:bottom-12 sm:right-0">
              Meet Glide
            </div>
          </div>
        </div>

        {/* ── MODAL PHASE ── */}
        {phase !== "splash" && (
          <div
            className="relative flex min-h-full w-full max-w-[860px] items-center px-0 py-2 sm:px-2"
            style={{ animation: "sg-modal-up 0.52s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            {/* Sheet */}
            <div className="max-h-[calc(100dvh-1.5rem)] w-full overflow-y-auto overflow-x-hidden rounded-[1.5rem] border border-white/[0.07] bg-[#0b1626]/95 shadow-[0_48px_140px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-[1.75rem]">

              {/* Header */}
              <div className="relative border-b border-white/[0.07] px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                <div className="grid items-center gap-4 sm:grid-cols-[1fr_112px]">
                  <div className="relative z-10 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-400">
                      Welcome to SLYDE
                    </p>
                    <h2 className="mt-2 text-xl font-extrabold leading-tight text-white sm:text-2xl lg:text-[1.7rem]">
                      Glide is here to get you moving
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                      Join Jamaica&apos;s delivery infrastructure as a Slyder, merchant, or supporter of the network.
                    </p>
                  </div>
                  <div className="pointer-events-none hidden justify-self-end sm:block" aria-hidden="true">
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-[0_20px_42px_-24px_rgba(34,197,94,0.8)] lg:h-28 lg:w-28">
                      <Image
                        src="/images/glide-whatsapp-cta.png"
                        alt=""
                        width={150}
                        height={150}
                        className="h-full w-full scale-[1.55] object-cover object-[50%_18%]"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-2 pb-1.5 pt-6 text-center text-[9px] font-black uppercase tracking-[0.18em] text-green-300">
                        Glide
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 lg:p-5">
                {/* ── Featured two (highlighted) ── */}
                <div className="mb-3 grid gap-2.5 sm:grid-cols-2">
                  {FEATURED.map((s, i) => {
                    const Icon = s.icon;
                    if (s.id === "slyder") {
                      return (
                        <div
                          key={s.id}
                          style={{ animation: `sg-card-in 0.48s ease ${0.08 + i * 0.1}s both` }}
                          className={`group relative overflow-hidden rounded-2xl border-2 p-4 transition duration-200 hover:-translate-y-0.5 shadow-[0_0_40px_-8px_rgba(14,165,233,0.35)] lg:p-5 ${s.border}`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${s.card}`} />
                          {/* Top glow line */}
                          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
                          <div className="relative">
                            <div className="flex items-start justify-between gap-3">
                              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-[0_0_20px_-4px_rgba(14,165,233,0.5)] lg:h-12 lg:w-12 ${s.iconRing}`}>
                                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                              </span>
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] ${s.badge}`}>
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
                                {s.sub}
                              </span>
                            </div>
                            <h3 className="mt-3 text-base font-extrabold text-white sm:mt-4 sm:text-lg">{s.title}</h3>
                            <p className="mt-1 text-xs leading-[1.55] text-slate-300 sm:block">{s.description}</p>
                            {/* Founding counter — visible on all screen sizes */}
                            <div className="mt-3">
                              <div className="mb-1.5 flex items-center justify-between text-[10px] text-slate-400">
                                <span className="font-semibold text-sky-300">{SLYDER_SPOT_COUNT} / {SLYDER_SPOT_TOTAL} spots reserved</span>
                                <span>{SLYDER_PCT}% filled</span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                                <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" style={{ width: `${SLYDER_PCT}%` }} />
                              </div>
                              <p className="mt-2 text-[10px] font-medium text-sky-400/80">No documents required &middot; Under 30 seconds &middot; WhatsApp updates</p>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <Link
                                href={s.href}
                                onClick={dismiss}
                                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-sky-500 px-3 text-xs font-bold text-white shadow-[0_4px_16px_-4px_rgba(14,165,233,0.6)] transition hover:bg-sky-400"
                              >
                                {s.cta}
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                              <Link
                                href={s.infoHref ?? "/become-a-slyder"}
                                onClick={dismiss}
                                className="inline-flex h-10 items-center justify-center rounded-full bg-white/[0.06] px-3 text-xs font-semibold text-slate-200 ring-1 ring-white/15 transition hover:bg-white/[0.12]"
                              >
                                {s.infoCta ?? "Learn More"}
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={s.id}
                        style={{ animation: `sg-card-in 0.48s ease ${0.08 + i * 0.1}s both` }}
                        className={`group relative overflow-hidden rounded-2xl border-2 p-4 transition duration-200 hover:-translate-y-0.5 shadow-[0_0_32px_-8px_rgba(16,185,129,0.25)] lg:p-5 ${s.border}`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${s.card}`} />
                        {/* Top glow line */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                        <div className="relative">
                          <div className="flex items-start justify-between gap-3">
                            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-[0_0_20px_-4px_rgba(16,185,129,0.4)] lg:h-12 lg:w-12 ${s.iconRing}`}>
                              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                            </span>
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] ${s.badge}`}>
                              {s.sub}
                            </span>
                          </div>
                          <h3 className="mt-3 text-base font-extrabold text-white sm:mt-4 sm:text-lg">{s.title}</h3>
                          <p className="mt-1 text-xs leading-[1.55] text-slate-300 sm:block">{s.description}</p>
                          <p className="mt-2 text-[10px] font-medium text-emerald-400/80">No commitment required &middot; Full onboarding comes after &middot; WhatsApp updates</p>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <Link
                              href={s.href}
                              onClick={dismiss}
                              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-emerald-500 px-3 text-xs font-bold text-white shadow-[0_4px_16px_-4px_rgba(16,185,129,0.55)] transition hover:bg-emerald-400"
                            >
                              {s.cta}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                            {s.infoHref && (
                              <Link
                                href={s.infoHref}
                                onClick={dismiss}
                                className="inline-flex h-10 items-center justify-center rounded-full bg-white/[0.06] px-3 text-xs font-semibold text-slate-200 ring-1 ring-white/15 transition hover:bg-white/[0.12]"
                              >
                                {s.infoCta ?? "Learn More"}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Secondary four ── */}
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                  {SECONDARY.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <Link
                        key={s.id}
                        href={s.href}
                        onClick={dismiss}
                        style={{ animation: `sg-card-in 0.48s ease ${0.28 + i * 0.07}s both` }}
                        className={`group relative overflow-hidden rounded-xl border p-3 transition duration-200 hover:-translate-y-0.5 lg:p-4 ${s.border}`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${s.card}`} />
                        <div className="relative">
                          <span className={`inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg ${s.iconRing}`}>
                            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </span>
                          <h3 className="mt-2 text-[11px] font-bold text-white leading-snug sm:mt-3 sm:text-sm">{s.title}</h3>
                          <p className="mt-1 hidden text-[11px] leading-[1.55] text-slate-500 md:block">{s.description}</p>
                          <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-sky-400 transition-all duration-150 group-hover:gap-2 sm:mt-3 sm:text-[11px]">
                            {s.cta}
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* ── Browse link (de-emphasised) ── */}
                <div
                  className="mt-3 flex justify-center sm:mt-4"
                  style={{ animation: "sg-card-in 0.48s ease 0.62s both" }}
                >
                  <button
                    onClick={dismiss}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 transition hover:text-slate-400"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    Prefer to browse first? Explore the full site
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
