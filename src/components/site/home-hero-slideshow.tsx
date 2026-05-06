"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  BriefcaseBusiness,
  Building2,
  UserRoundCheck,
  Sparkles,
  Package,
  Truck,
  MapPinned,
  Radar,
  Waypoints,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const globalCtas = [
  {
    label: "Track Page",
    href: "/for-businesses/status",
    icon: Waypoints,
    tone: "sky",
    kicker: "Live status",
  },
  {
    label: "Apply as Slyder",
    href: "/join/slyder",
    icon: UserRoundCheck,
    tone: "cyan",
    kicker: "Courier path",
  },
  {
    label: "Apply as Merchant",
    href: "/for-businesses",
    icon: BriefcaseBusiness,
    tone: "blue",
    kicker: "Business ops",
  },
  {
    label: "Social Media Seller",
    href: "/for-businesses/slyde",
    icon: Sparkles,
    tone: "amber",
    kicker: "Merchant-Lite",
  },
] as const;

const loginShortcuts = [
  { label: "Slyder", href: "/slyder/login", tone: "cyan", icon: UserRoundCheck },
  { label: "Merchant", href: "/merchant/login", tone: "blue", icon: BriefcaseBusiness },
  { label: "Employee", href: "/employee/login", tone: "sky", icon: Building2 },
  { label: "Admin", href: "/admin/login", tone: "amber", icon: ShieldCheck },
] as const;

// ---------------------------------------------------------------------------
// Slide definitions
// ---------------------------------------------------------------------------

const slides = [
  {
    id: "brand",
    eyebrow: "SLYDE Logistics Network",
    headline: "Jamaica's most structured delivery network",
    description:
      "SLYDE connects merchants, independent couriers, and customers through a smarter, more accountable delivery operation - built for Jamaica first and designed to scale.",
    primaryCta: { label: "See how it works", href: "#how-it-works" },
    secondaryCta: { label: "Join as a Slyder", href: "/join/slyder" },
    theme: "navy",
    fullBleed: "/images/hero-brand-network.jpg",
    objectPosition: "62% 38%",
    motion: "reveal",
    // keep the branded cluster visible on narrow screens without over-cropping
    mobileObjectPosition: "68% 40%",
  },
  {
    id: "businesses",
    eyebrow: "For Businesses",
    headline: "Launch same-day delivery without building a fleet",
    description:
      "Partner with SLYDE to access a verified courier network, live job tracking, and proof-of-delivery support - without the overhead of recruiting or managing your own drivers.",
    primaryCta: { label: "Partner with SLYDE", href: "/for-businesses" },
    secondaryCta: { label: "Learn how it works", href: "/for-businesses#how" },
    theme: "blue",
    fullBleed: "/images/hero-businesses.jpg",
    objectPosition: "center center",
    motion: "parallax",
    mobileObjectPosition: "center center",
  },
  {
    id: "slyders",
    eyebrow: "For Slyders",
    headline: "A smarter, more structured way to earn",
    description:
      "SLYDE gives independent couriers a clear path from application to activation - with digital payout support, job visibility, and a professional delivery platform behind your work.",
    primaryCta: { label: "Join as a Slyder", href: "/join/slyder" },
    secondaryCta: { label: "Explore Slyder payouts", href: "/slyder-payouts" },
    theme: "sky",
    fullBleed: "/images/hero-slyders-earnings.jpg",
    objectPosition: "66% 28%",
    motion: "lift",
    // keep the rider and app UI in frame while matching the other slides' crop feel
    mobileObjectPosition: "70% 30%",
  },
  {
    id: "merchant-lite",
    eyebrow: "SLYDE Merchant-Lite",
    headline: "Sell from anywhere. We handle the delivery.",
    description:
      "Keep selling through Instagram, WhatsApp, and your existing customer channels while SLYDE handles structured pickup, dispatch, and doorstep delivery for your business.",
    primaryCta: { label: "Explore Merchant-Lite", href: "/for-businesses/slyde" },
    secondaryCta: { label: "Partner with SLYDE", href: "/for-businesses" },
    theme: "amber",
    fullBleed: "/images/hero-merchant-lite-social.png",
    motion: "glow",
    // keep the merchant and delivery handoff visible on portrait crop
    objectPosition: "56% center",
    mobileObjectPosition: "56% center",
  },
] as const;

type SlideTheme = (typeof slides)[number]["theme"];

// ---------------------------------------------------------------------------
// Per-slide gradient / colour tokens
// ---------------------------------------------------------------------------

const themeConfig: Record<
  SlideTheme,
  {
    bg: string;
    gradientOverlay: string;
    eyebrowClass: string;
    dotActive: string;
    primaryBtn: string;
    secondaryBtn: string;
    accentA: string;
    accentB: string;
    accentC: string;
  }
> = {
  navy: {
    bg: "bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,rgba(56,189,248,0.18),transparent),linear-gradient(160deg,#0f172a_0%,#0c1a2e_55%,#0f172a_100%)]",
    gradientOverlay:
      "bg-[radial-gradient(circle_at_80%_50%,rgba(56,189,248,0.12),transparent_55%)]",
    eyebrowClass: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    dotActive: "bg-sky-400",
    primaryBtn:
      "inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400",
    secondaryBtn:
      "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:border-white/40 hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
    accentA: "bg-sky-400/15",
    accentB: "bg-cyan-300/10",
    accentC: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  },
  blue: {
    bg: "bg-[radial-gradient(ellipse_70%_50%_at_65%_-5%,rgba(99,179,237,0.20),transparent),linear-gradient(155deg,#0a1628_0%,#0d1f3c_50%,#06101e_100%)]",
    gradientOverlay:
      "bg-[radial-gradient(circle_at_75%_45%,rgba(59,130,246,0.16),transparent_50%)]",
    eyebrowClass: "border-blue-400/30 bg-blue-400/10 text-blue-300",
    dotActive: "bg-blue-400",
    primaryBtn:
      "inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
    secondaryBtn:
      "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:border-white/40 hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
    accentA: "bg-blue-400/15",
    accentB: "bg-indigo-300/10",
    accentC: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  },
  sky: {
    bg: "bg-[radial-gradient(ellipse_75%_55%_at_60%_-8%,rgba(14,165,233,0.22),transparent),linear-gradient(150deg,#0c1a2e_0%,#0e2a40_55%,#071520_100%)]",
    gradientOverlay:
      "bg-[radial-gradient(circle_at_70%_40%,rgba(34,211,238,0.14),transparent_50%)]",
    eyebrowClass: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    dotActive: "bg-cyan-400",
    primaryBtn:
      "inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
    secondaryBtn:
      "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:border-white/40 hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
    accentA: "bg-cyan-400/15",
    accentB: "bg-sky-300/10",
    accentC: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  },
  amber: {
    bg: "bg-[radial-gradient(ellipse_75%_55%_at_62%_-8%,rgba(249,115,22,0.24),transparent),linear-gradient(150deg,#1a120c_0%,#2b1707_48%,#120d09_100%)]",
    gradientOverlay:
      "bg-[radial-gradient(circle_at_72%_42%,rgba(251,146,60,0.16),transparent_50%)]",
    eyebrowClass: "border-orange-400/30 bg-orange-400/10 text-orange-200",
    dotActive: "bg-orange-400",
    primaryBtn:
      "inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400",
    secondaryBtn:
      "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:border-white/40 hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
    accentA: "bg-orange-400/15",
    accentB: "bg-amber-300/10",
    accentC: "border-orange-400/20 bg-orange-400/10 text-orange-200",
  },
};

// ---------------------------------------------------------------------------
// Per-slide decorative visual panels
// ---------------------------------------------------------------------------

function BrandVisual() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Hero photo - fills the right panel */}
      <Image
        src="/images/hero-slyders.jpg"
        alt="SLYDE Logistics couriers on scooters in Jamaica"
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="h-full w-full object-cover object-center"
      />

      {/* Subtle dark vignette so the text panel stays readable */}
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-slate-950/60" />

      {/* Floating status pills */}
      <div className="absolute right-4 top-6 z-10 flex items-center gap-2 rounded-full border border-sky-400/20 bg-slate-900/80 px-3 py-1.5 backdrop-blur-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        <span className="text-xs font-medium text-white/80">Network live</span>
      </div>
      <div className="absolute bottom-6 left-4 z-10 flex items-center gap-2 rounded-full border border-sky-400/20 bg-slate-900/80 px-3 py-1.5 backdrop-blur-sm">
        <Radar className="h-3 w-3 text-sky-400" />
        <span className="text-xs font-medium text-white/80">Jamaica-first launch</span>
      </div>
    </div>
  );
}

function BusinessVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-[340px] space-y-3">
        {/* Mock dispatch card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">Active delivery</p>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">In transit</span>
          </div>
          <p className="mt-2 text-base font-semibold text-white">Order #SL-00412</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-white/10">
              <div className="h-full w-[65%] rounded-full bg-blue-400" />
            </div>
            <span className="text-xs text-white/50">65%</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Picked up", done: true },
              { label: "In transit", done: true },
              { label: "Delivered", done: false },
            ].map(({ label, done }) => (
              <div key={label} className="rounded-xl border border-white/8 bg-white/5 px-2 py-2">
                <div className={`mx-auto mb-1.5 h-2 w-2 rounded-full ${done ? "bg-emerald-400" : "bg-white/20"}`} />
                <p className={`text-xs font-medium ${done ? "text-white/80" : "text-white/35"}`}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "12", label: "Active jobs", icon: Package },
            { value: "3", label: "Zones covered", icon: MapPinned },
            { value: "98%", label: "Completed", icon: ShieldCheck },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm">
              <Icon className="mx-auto mb-1 h-4 w-4 text-blue-300" />
              <p className="text-lg font-bold text-white">{value}</p>
              <p className="text-xs text-white/50">{label}</p>
            </div>
          ))}
        </div>

        {/* Merchant badge */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10">
            <BriefcaseBusiness className="h-4 w-4 text-blue-300" />
          </span>
          <div>
            <p className="text-xs font-semibold text-white/80">Merchant-ready operations</p>
            <p className="text-xs text-white/40">No fleet build-out required</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlyderVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-[340px] space-y-3">
        {/* Earnings card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">This week</p>
            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-300">+18% vs last week</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">J$12,450</p>
          <p className="mt-1 text-sm text-white/50">Pending payout Â· 6 completed jobs</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { day: "Mon", height: "h-8" },
              { day: "Tue", height: "h-12" },
              { day: "Wed", height: "h-6" },
              { day: "Thu", height: "h-16" },
              { day: "Fri", height: "h-10" },
              { day: "Sat", height: "h-14" },
            ].map(({ day, height }) => (
              <div key={day} className="flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-lg bg-cyan-400/30 ${height}`} />
                <p className="text-xs text-white/40">{day}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Status + onboarding */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <UserRoundCheck className="mb-2 h-4 w-4 text-cyan-300" />
            <p className="text-sm font-semibold text-white">Verified</p>
            <p className="text-xs text-white/40">Account active</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <Truck className="mb-2 h-4 w-4 text-cyan-300" />
            <p className="text-sm font-semibold text-white">On-route</p>
            <p className="text-xs text-white/40">2 jobs today</p>
          </div>
        </div>

        {/* Payout ready pill */}
        <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/8 px-4 py-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          <p className="text-xs font-semibold text-cyan-200">Digital payout support Â· Structured workflow</p>
        </div>
      </div>
    </div>
  );
}

const slideVisuals = [BrandVisual, BusinessVisual, SlyderVisual];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const AUTOPLAY_MS = 6000;

export function HomeHeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<"next" | "prev">("next");
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (index: number, direction: "next" | "prev") => {
      if (isAnimating || index === current) return;
      setTransitionDirection(direction);
      setIncomingIndex(index);
      setIsAnimating(true);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => {
        setCurrent(index);
        setIncomingIndex(null);
        setIsAnimating(false);
      }, 760);
    },
    [current, isAnimating],
  );

  const next = useCallback(() => goTo((current + 1) % slides.length, "next"), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length, "prev"), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, next]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  const slide = slides[current];
  const incomingSlide = incomingIndex === null ? slide : slides[incomingIndex];
  const theme = themeConfig[slide.theme];
  const sectionMinHeight = isMobileViewport
    ? "clamp(250px, 70vw, 360px)"
    : "clamp(420px, 62vw, 860px)";

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return; // ignore micro-swipes
    if (delta < 0) next(); else prev();
  }, [next, prev]);

  const renderSlideLayer = (
    layerSlide: (typeof slides)[number],
    layerType: "base" | "outgoing" | "incoming",
  ) => {
    const layerImageSrc = (layerSlide as { fullBleed?: string }).fullBleed ?? "";
    const layerObjectPos = isMobileViewport
      ? (layerSlide as { mobileObjectPosition?: string }).mobileObjectPosition ??
        (layerSlide as { objectPosition?: string }).objectPosition ??
        "center center"
      : (layerSlide as { objectPosition?: string }).objectPosition ?? "center center";
    const layerAnimationClass =
      layerType === "base"
        ? "hero-slide-resting"
        : layerType === "incoming"
          ? transitionDirection === "next"
            ? "hero-slide-enter-next"
            : "hero-slide-enter-prev"
          : transitionDirection === "next"
            ? "hero-slide-exit-next"
            : "hero-slide-exit-prev";

    return (
      <div
        key={`${layerType}-${layerSlide.id}-${transitionDirection}`}
        className={`absolute inset-0 ${layerAnimationClass}`}
        data-motion={layerSlide.motion}
      >
        {layerImageSrc && isMobileViewport ? (
          <>
            <Image
              src={layerImageSrc}
              alt=""
              fill
              priority={layerType === "base" && current === 0}
              sizes="100vw"
              className="hero-slide-image hero-slide-image-mobile-bg object-cover"
              style={{ objectPosition: layerObjectPos }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.28))]" aria-hidden />
            <div className="absolute inset-x-0 inset-y-0 px-2 pt-2 pb-12">
              <Image
                src={layerImageSrc}
                alt={layerType === "base" ? layerSlide.headline : ""}
                fill
                priority={layerType === "base" && current === 0}
                sizes="100vw"
                className="hero-slide-image hero-slide-image-mobile object-contain"
                style={{ objectPosition: "center center" }}
                aria-hidden={layerType !== "base"}
              />
            </div>
          </>
        ) : layerImageSrc ? (
          <Image
            src={layerImageSrc}
            alt={layerType === "base" ? layerSlide.headline : ""}
            fill
            priority={layerType === "base" && current === 0}
            sizes="(max-width: 640px) 100vw, 100vw"
            className="hero-slide-image object-cover"
            style={{ objectPosition: layerObjectPos }}
            aria-hidden={layerType !== "base"}
          />
        ) : null}
        <div className="hero-slide-atmosphere" aria-hidden />
      </div>
    );
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-950"
      aria-label="SLYDE hero slideshow"
      style={{ minHeight: sectionMinHeight }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {renderSlideLayer(slide, "base")}
      {isAnimating ? renderSlideLayer(slide, "outgoing") : null}
      {isAnimating && incomingSlide.id !== slide.id ? renderSlideLayer(incomingSlide, "incoming") : null}

      {/* Nav controls — sit above safe-area bottom inset */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-4 sm:pb-5"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))" }}
      >
        <div className="flex items-center gap-2.5 rounded-full border border-white/14 bg-black/28 px-2.5 py-2 backdrop-blur sm:gap-3 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-0">
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/80 backdrop-blur transition active:scale-95 hover:bg-black/70 hover:text-white sm:h-9 sm:w-9"
          >
            <ChevronLeft className="h-4.5 w-4.5 sm:h-4 sm:w-4" />
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i, i > current ? "next" : "prev")}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? `h-2 w-7 sm:h-2.5 sm:w-8 ${theme.dotActive}`
                    : "h-2 w-2 bg-white/40 hover:bg-white/70 sm:h-2.5 sm:w-2.5"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            aria-label="Next slide"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/80 backdrop-blur transition active:scale-95 hover:bg-black/70 hover:text-white sm:h-9 sm:w-9"
          >
            <ChevronRight className="h-4.5 w-4.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 h-0.5 bg-white/10"
        style={{ width: "100%" }}
      >
        <div
          key={current}
          className={`h-full ${theme.dotActive} origin-left`}
          style={{
            animation: `slideProgress ${AUTOPLAY_MS}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes slideProgress {
          from { width: 0%; }
          to { width: 100%; }
        }

        @keyframes heroSlideInNext {
          0% {
            opacity: 0;
            transform: translate3d(3.6%, 0, 0) scale(1.08);
            filter: blur(12px);
          }
          55% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes heroSlideInPrev {
          0% {
            opacity: 0;
            transform: translate3d(-3.6%, 0, 0) scale(1.08);
            filter: blur(12px);
          }
          55% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes heroSlideOutNext {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0);
          }
          100% {
            opacity: 0;
            transform: translate3d(-2.4%, 0, 0) scale(1.04);
            filter: blur(8px);
          }
        }

        @keyframes heroSlideOutPrev {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0);
          }
          100% {
            opacity: 0;
            transform: translate3d(2.4%, 0, 0) scale(1.04);
            filter: blur(8px);
          }
        }

        @keyframes heroRevealInNext {
          0% {
            clip-path: inset(0 0 0 100%);
            transform: scale(1.08);
          }
          100% {
            clip-path: inset(0 0 0 0);
            transform: scale(1);
          }
        }

        @keyframes heroRevealInPrev {
          0% {
            clip-path: inset(0 100% 0 0);
            transform: scale(1.08);
          }
          100% {
            clip-path: inset(0 0 0 0);
            transform: scale(1);
          }
        }

        @keyframes heroParallaxIn {
          0% {
            transform: translate3d(0, 0, 0) scale(1.12);
            filter: saturate(1.12) brightness(0.92);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1.01);
            filter: saturate(1) brightness(1);
          }
        }

        @keyframes heroLiftIn {
          0% {
            transform: translate3d(0, 4.5%, 0) scale(1.06);
            filter: brightness(0.9) blur(8px);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1.01);
            filter: brightness(1) blur(0);
          }
        }

        @keyframes heroGlowIn {
          0% {
            transform: scale(1.1);
            filter: brightness(0.82) saturate(0.9);
          }
          48% {
            filter: brightness(1.12) saturate(1.08);
          }
          100% {
            transform: scale(1.01);
            filter: brightness(1) saturate(1);
          }
        }

        .hero-slide-image {
          transform: scale(1.01);
          will-change: transform, filter, clip-path;
        }

        .hero-slide-image-mobile-bg {
          transform: scale(1.08);
          filter: blur(12px) saturate(0.92) brightness(0.72);
        }

        .hero-slide-image-mobile {
          transform: none;
          filter: drop-shadow(0 14px 28px rgba(2, 6, 23, 0.22));
        }

        .hero-slide-resting {
          opacity: 1;
        }

        .hero-slide-enter-next,
        .hero-slide-enter-prev,
        .hero-slide-exit-next,
        .hero-slide-exit-prev {
          will-change: transform, opacity, filter;
        }

        .hero-slide-enter-next {
          animation: heroSlideInNext 720ms cubic-bezier(0.22, 0.8, 0.22, 1) both;
        }

        .hero-slide-enter-prev {
          animation: heroSlideInPrev 720ms cubic-bezier(0.22, 0.8, 0.22, 1) both;
        }

        .hero-slide-exit-next {
          animation: heroSlideOutNext 320ms cubic-bezier(0.32, 0.72, 0.22, 1) both;
        }

        .hero-slide-exit-prev {
          animation: heroSlideOutPrev 320ms cubic-bezier(0.32, 0.72, 0.22, 1) both;
        }

        .hero-slide-enter-next[data-motion="reveal"] .hero-slide-image {
          animation: heroRevealInNext 820ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .hero-slide-enter-prev[data-motion="reveal"] .hero-slide-image {
          animation: heroRevealInPrev 820ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .hero-slide-enter-next[data-motion="parallax"] .hero-slide-image,
        .hero-slide-enter-prev[data-motion="parallax"] .hero-slide-image,
        .hero-slide-resting[data-motion="parallax"] .hero-slide-image {
          animation: heroParallaxIn 980ms cubic-bezier(0.18, 0.8, 0.22, 1) both;
        }

        .hero-slide-enter-next[data-motion="lift"] .hero-slide-image,
        .hero-slide-enter-prev[data-motion="lift"] .hero-slide-image,
        .hero-slide-resting[data-motion="lift"] .hero-slide-image {
          animation: heroLiftIn 860ms cubic-bezier(0.2, 0.8, 0.22, 1) both;
        }

        .hero-slide-enter-next[data-motion="glow"] .hero-slide-image,
        .hero-slide-enter-prev[data-motion="glow"] .hero-slide-image,
        .hero-slide-resting[data-motion="glow"] .hero-slide-image {
          animation: heroGlowIn 940ms cubic-bezier(0.2, 0.8, 0.22, 1) both;
        }

        .hero-slide-atmosphere {
          position: absolute;
          inset: 0;
          background: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-slide-image,
          .hero-slide-enter-next,
          .hero-slide-enter-prev,
          .hero-slide-exit-next,
          .hero-slide-exit-prev {
            animation: none !important;
            transform: none !important;
            filter: none !important;
            clip-path: none !important;
          }
        }

        @media (max-width: 767px) {
          .hero-slide-enter-next[data-motion="reveal"] .hero-slide-image-mobile,
          .hero-slide-enter-prev[data-motion="reveal"] .hero-slide-image-mobile,
          .hero-slide-enter-next[data-motion="parallax"] .hero-slide-image-mobile,
          .hero-slide-enter-prev[data-motion="parallax"] .hero-slide-image-mobile,
          .hero-slide-resting[data-motion="parallax"] .hero-slide-image-mobile,
          .hero-slide-enter-next[data-motion="lift"] .hero-slide-image-mobile,
          .hero-slide-enter-prev[data-motion="lift"] .hero-slide-image-mobile,
          .hero-slide-resting[data-motion="lift"] .hero-slide-image-mobile,
          .hero-slide-enter-next[data-motion="glow"] .hero-slide-image-mobile,
          .hero-slide-enter-prev[data-motion="glow"] .hero-slide-image-mobile,
          .hero-slide-resting[data-motion="glow"] .hero-slide-image-mobile {
            animation: none !important;
            transform: none !important;
            filter: drop-shadow(0 14px 28px rgba(2, 6, 23, 0.22)) !important;
          }
        }

        .hero-cta-card[data-tone="sky"] {
          --cta-glow: rgba(56, 189, 248, 0.22);
          --cta-line: rgba(56, 189, 248, 0.92);
        }

        .hero-cta-card[data-tone="cyan"] {
          --cta-glow: rgba(34, 211, 238, 0.22);
          --cta-line: rgba(34, 211, 238, 0.94);
        }

        .hero-cta-card[data-tone="blue"] {
          --cta-glow: rgba(96, 165, 250, 0.22);
          --cta-line: rgba(96, 165, 250, 0.94);
        }

        .hero-cta-card[data-tone="amber"] {
          --cta-glow: rgba(251, 146, 60, 0.24);
          --cta-line: rgba(251, 146, 60, 0.96);
        }

      `}</style>
    </section>
  );
}

export function HomeHeroFastAccessBar() {
  return (
    <section className="relative z-10 mt-8 px-4 sm:mt-10 sm:px-6 lg:mt-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 text-center sm:mb-5">
          <p className="text-lg font-semibold tracking-tight text-white sm:text-2xl lg:text-[1.9rem]">
            I am a:
          </p>
        </div>
        <div className="mb-8 flex flex-wrap items-start justify-center gap-4 sm:mb-10 sm:gap-6 lg:mb-12 lg:gap-8">
          {loginShortcuts.map(({ label, href, tone, icon: Icon }) => (
            <Link key={label} href={href} className="hero-login-orb" data-tone={tone} aria-label={`${label} login`}>
              <span className="hero-login-orb-ring" aria-hidden />
              <span className="hero-login-orb-icon">
                <Icon className="h-4 w-4" />
              </span>
              <span className="hero-login-orb-label">{label}</span>
            </Link>
          ))}
        </div>

        <div className="hero-cta-shell w-full">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="hero-cta-eyebrow">Fast access</p>
              <p className="hero-cta-copy">
                Jump straight into the SLYDE network with the route that fits your delivery workflow.
              </p>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/62 backdrop-blur lg:inline-flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.8)]" />
              Logistics shortcuts
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {globalCtas.map(({ label, href, icon: Icon, tone, kicker }) => (
              <Link
                key={label}
                href={href}
                className="hero-cta-card group"
                data-tone={tone}
              >
                <span className="hero-cta-card-bg" aria-hidden />
                <span className="hero-cta-card-glow" aria-hidden />
                <span className="hero-cta-card-topline" aria-hidden />
                <span className="hero-cta-card-content">
                  <span className="hero-cta-card-kicker">
                    {kicker}
                    <span className="hero-cta-card-route" aria-hidden />
                  </span>
                  <span className="hero-cta-card-main">
                    <span className="hero-cta-card-icon">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="hero-cta-card-label">{label}</span>
                  </span>
                  <span className="hero-cta-card-meta">
                    Open route
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .hero-cta-shell {
          position: relative;
          border-radius: 1.6rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.8rem;
          backdrop-filter: blur(16px);
          background:
            linear-gradient(180deg, rgba(5, 14, 30, 0.72), rgba(4, 10, 24, 0.52)),
            radial-gradient(circle at top right, rgba(125, 211, 252, 0.16), transparent 24%);
          box-shadow:
            0 22px 56px -34px rgba(2, 6, 23, 0.92),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        .hero-cta-eyebrow {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(186, 230, 253, 0.88);
        }

        .hero-cta-copy {
          margin-top: 0.3rem;
          max-width: 32rem;
          font-size: 0.82rem;
          line-height: 1.45;
          color: rgba(226, 232, 240, 0.78);
        }

        .hero-login-orb {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 0.65rem;
          min-width: 82px;
          color: rgba(255, 255, 255, 0.98);
          text-align: center;
        }

        .hero-login-orb-ring,
        .hero-login-orb-icon {
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
        }

        .hero-login-orb-ring {
          position: absolute;
          top: -0.18rem;
          height: 3.55rem;
          width: 3.55rem;
          border-radius: 999px;
          border: 1px solid var(--pill-border);
          background: radial-gradient(circle, var(--pill-glow) 0%, transparent 70%);
          filter: blur(0.2px);
        }

        .hero-login-orb-icon {
          position: relative;
          z-index: 1;
          display: inline-flex;
          height: 3.2rem;
          width: 3.2rem;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid var(--pill-border);
          background:
            linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0.08)),
            radial-gradient(circle at top left, var(--pill-glow), transparent 72%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.22),
            0 16px 28px -18px rgba(2, 6, 23, 0.95),
            0 0 18px -10px var(--pill-glow);
        }

        .hero-login-orb-label {
          position: relative;
          z-index: 1;
          font-size: 0.64rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(241, 245, 249, 0.92);
          text-shadow: 0 1px 10px rgba(2, 6, 23, 0.42);
        }

        .hero-login-orb:hover .hero-login-orb-icon,
        .hero-login-orb:hover .hero-login-orb-ring {
          transform: translateY(-2px) scale(1.03);
          border-color: var(--pill-border-strong);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.24),
            0 18px 30px -18px rgba(2, 6, 23, 0.98),
            0 0 24px -8px var(--pill-glow);
        }

        .hero-login-orb[data-tone="sky"] {
          --pill-glow: rgba(56, 189, 248, 0.32);
          --pill-border: rgba(56, 189, 248, 0.38);
          --pill-border-strong: rgba(56, 189, 248, 0.62);
        }

        .hero-login-orb[data-tone="cyan"] {
          --pill-glow: rgba(34, 211, 238, 0.32);
          --pill-border: rgba(34, 211, 238, 0.38);
          --pill-border-strong: rgba(34, 211, 238, 0.62);
        }

        .hero-login-orb[data-tone="blue"] {
          --pill-glow: rgba(96, 165, 250, 0.32);
          --pill-border: rgba(96, 165, 250, 0.38);
          --pill-border-strong: rgba(96, 165, 250, 0.62);
        }

        .hero-login-orb[data-tone="amber"] {
          --pill-glow: rgba(251, 146, 60, 0.34);
          --pill-border: rgba(251, 146, 60, 0.4);
          --pill-border-strong: rgba(251, 146, 60, 0.64);
        }

        .hero-cta-card {
          position: relative;
          min-height: 102px;
          overflow: hidden;
          border-radius: 1.2rem;
          border: 1px solid rgba(255, 255, 255, 0.14);
          transform-style: preserve-3d;
          transition:
            transform 260ms cubic-bezier(0.22, 0.8, 0.22, 1),
            box-shadow 260ms ease,
            border-color 260ms ease;
          box-shadow:
            0 20px 38px -28px rgba(2, 6, 23, 0.95),
            0 12px 18px -14px rgba(15, 23, 42, 0.86),
            inset 0 1px 0 rgba(255, 255, 255, 0.14);
        }

        .hero-cta-card:hover {
          transform: translateY(-4px) rotateX(4deg) rotateY(-3deg) scale(1.01);
          border-color: rgba(255, 255, 255, 0.28);
          box-shadow:
            0 20px 34px -22px rgba(2, 6, 23, 0.98),
            0 12px 20px -16px rgba(14, 165, 233, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .hero-cta-card-bg,
        .hero-cta-card-glow,
        .hero-cta-card-topline,
        .hero-cta-card-content {
          position: absolute;
          inset: 0;
        }

        .hero-cta-card-bg {
          background:
            linear-gradient(180deg, rgba(13, 21, 39, 0.98), rgba(7, 13, 28, 0.96)),
            repeating-linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.03) 0,
              rgba(255, 255, 255, 0.03) 10px,
              rgba(255, 255, 255, 0.01) 10px,
              rgba(255, 255, 255, 0.01) 20px
            );
        }

        .hero-cta-card-glow {
          opacity: 0.88;
          transition: transform 260ms ease, opacity 260ms ease;
          background:
            radial-gradient(circle at 14% 20%, var(--cta-glow), transparent 32%),
            radial-gradient(circle at 85% 100%, rgba(255, 255, 255, 0.08), transparent 30%);
        }

        .hero-cta-card:hover .hero-cta-card-glow {
          opacity: 1;
          transform: scale(1.06);
        }

        .hero-cta-card-topline {
          inset: 0 auto auto 0;
          height: 2px;
          width: 100%;
          background: linear-gradient(90deg, transparent 0%, var(--cta-line) 18%, transparent 74%);
          opacity: 0.9;
        }

        .hero-cta-card-content {
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 0.8rem 0.85rem 0.85rem;
        }

        .hero-cta-card-kicker {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.55rem;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(226, 232, 240, 0.7);
        }

        .hero-cta-card-route {
          display: inline-flex;
          width: 38px;
          height: 6px;
          border-radius: 999px;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.1)),
            radial-gradient(circle at 14% 50%, var(--cta-line) 0 18%, transparent 20%);
          position: relative;
          overflow: hidden;
        }

        .hero-cta-card-route::after {
          content: "";
          position: absolute;
          inset: 1px auto 1px 2px;
          width: 10px;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, var(--cta-line), transparent);
          animation: routePulse 2.8s linear infinite;
        }

        .hero-cta-card-main {
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }

        .hero-cta-card-icon {
          display: inline-flex;
          height: 2.35rem;
          width: 2.35rem;
          align-items: center;
          justify-content: center;
          border-radius: 0.85rem;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.06)),
            radial-gradient(circle at top left, var(--cta-glow), transparent 64%);
          color: white;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.18),
            0 10px 18px -12px rgba(0,0,0,0.9);
          transition: transform 260ms ease;
        }

        .hero-cta-card:hover .hero-cta-card-icon {
          transform: translate3d(0, -1px, 10px);
        }

        .hero-cta-card-label {
          font-size: 0.9rem;
          font-weight: 700;
          line-height: 1.25;
          color: rgba(248, 250, 252, 0.98);
        }

        .hero-cta-card-meta {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.74);
        }

        .hero-cta-card[data-tone="sky"] {
          --cta-glow: rgba(56, 189, 248, 0.22);
          --cta-line: rgba(56, 189, 248, 0.92);
        }

        .hero-cta-card[data-tone="cyan"] {
          --cta-glow: rgba(34, 211, 238, 0.22);
          --cta-line: rgba(34, 211, 238, 0.94);
        }

        .hero-cta-card[data-tone="blue"] {
          --cta-glow: rgba(96, 165, 250, 0.22);
          --cta-line: rgba(96, 165, 250, 0.94);
        }

        .hero-cta-card[data-tone="amber"] {
          --cta-glow: rgba(251, 146, 60, 0.24);
          --cta-line: rgba(251, 146, 60, 0.96);
        }

        @keyframes routePulse {
          from { transform: translateX(0); opacity: 0.35; }
          50% { opacity: 1; }
          to { transform: translateX(28px); opacity: 0.35; }
        }

        @media (max-width: 767px) {
          .hero-cta-shell {
            padding: 0.7rem;
            border-radius: 1.35rem;
          }

          .hero-cta-copy {
            display: none;
          }

          .hero-cta-card {
            min-height: 96px;
          }

          .hero-cta-card-content {
            padding: 0.75rem;
          }

          .hero-cta-card-main {
            gap: 0.6rem;
          }

          .hero-cta-card-label {
            font-size: 0.82rem;
          }

          .hero-cta-card-icon {
            height: 2.15rem;
            width: 2.15rem;
          }

          .hero-cta-card-kicker {
            font-size: 0.56rem;
          }

          .hero-login-orb {
            min-width: 64px;
            gap: 0.45rem;
          }

          .hero-login-orb-ring {
            height: 3.15rem;
            width: 3.15rem;
          }

          .hero-login-orb-icon {
            height: 2.8rem;
            width: 2.8rem;
          }

          .hero-login-orb-label {
            font-size: 0.58rem;
          }
        }

        @media (max-width: 479px) {
          .hero-cta-shell {
            padding: 0.65rem;
            border-radius: 1.15rem;
          }

          .hero-cta-card {
            min-height: 88px;
            border-radius: 1rem;
          }

          .hero-cta-card-content {
            padding: 0.7rem;
          }

          .hero-cta-card-kicker {
            font-size: 0.52rem;
            letter-spacing: 0.14em;
          }

          .hero-cta-card-label {
            font-size: 0.78rem;
          }

          .hero-cta-card-meta {
            font-size: 0.68rem;
          }

          .hero-login-orb {
            min-width: 58px;
            gap: 0.4rem;
          }

          .hero-login-orb-ring {
            height: 2.8rem;
            width: 2.8rem;
          }

          .hero-login-orb-icon {
            height: 2.5rem;
            width: 2.5rem;
          }

          .hero-login-orb-label {
            font-size: 0.54rem;
            letter-spacing: 0.1em;
          }
        }

        @media (min-width: 1024px) {
          .hero-cta-copy {
            max-width: 26rem;
          }

          .hero-cta-card {
            min-height: 94px;
          }
        }
      `}</style>
    </section>
  );
}

const heroActionStripItems = [
  { label: "Real-time Tracking", icon: Radar },
  { label: "Verified Drivers", icon: UserRoundCheck },
  { label: "Secure Deliveries", icon: ShieldCheck },
  { label: "Business Growth", icon: BriefcaseBusiness },
] as const;

export function HomeHeroActionStrip() {
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState("");

  const handleTrackPackage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = trackingCode.trim();
    if (!code) return;
    router.push(`/track/${encodeURIComponent(code)}`);
  };

  return (
    <section className="relative z-10 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,248,241,0.98),rgba(255,253,249,0.96))] shadow-[0_28px_60px_-34px_rgba(15,23,42,0.22)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:flex-row lg:items-center lg:gap-3 lg:px-5">
            <form onSubmit={handleTrackPackage} className="grid min-w-0 flex-1 gap-2.5 lg:grid-cols-[minmax(0,1.3fr)_auto_auto] lg:items-center">
              <label className="flex min-w-0 items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-3 text-slate-500 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.24),inset_0_1px_0_rgba(255,255,255,0.92)]">
                <Package className="h-4 w-4 shrink-0 text-slate-500" />
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(event) => setTrackingCode(event.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  aria-label="Enter your package tracking number"
                />
              </label>
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_18px_32px_-20px_rgba(15,23,42,0.75)] transition hover:-translate-y-0.5 hover:bg-slate-900"
              >
                Track package
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/for-businesses"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-[0_14px_28px_-22px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                Start a delivery
              </Link>
            </form>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
              {heroActionStripItems.map(({ label, icon: Icon }, index) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 rounded-[1rem] px-3 py-2 text-slate-700 lg:rounded-none lg:px-4 lg:py-1 ${
                    index > 0 ? "lg:border-l lg:border-slate-200/85" : ""
                  }`}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[13px] font-medium tracking-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
