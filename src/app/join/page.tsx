import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, HeartHandshake, MapPin, MessageCircle, Network, PackageSearch, Truck, Zap } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Join SLYDE — Reserve Your Founding Spot",
  "Become a Founding Slyder courier or register your business as a Founding Merchant. Join Jamaica's new delivery infrastructure.",
  "/join",
);

// TODO: analytics hook — entrance_gateway_viewed

const SLYDER_SPOT_COUNT = 243;
const SLYDER_SPOT_TOTAL = 500;
const SLYDER_PCT = Math.round((SLYDER_SPOT_COUNT / SLYDER_SPOT_TOTAL) * 100);

const trustItems = [
  { label: "Digital payout support" },
  { label: "Flexible independent earning" },
  { label: "Merchant delivery network" },
  { label: "WhatsApp-first onboarding" },
  { label: "Launch priority access" },
];

const secondaryActions = [
  {
    icon: PackageSearch,
    label: "Track a Delivery",
    description: "Follow your delivery in real time. Enter your tracking code to get an update.",
    href: "/contact",
    cta: "Get Tracking Help",
    comingSoon: false,
  },
  {
    icon: HeartHandshake,
    label: "Refer a Slyder",
    description: "Know someone who'd make a great Slyder? Send them your referral link.",
    href: "/refer-a-slyder",
    cta: "Refer a Slyder",
    comingSoon: false,
  },
  {
    icon: Zap,
    label: "Dispatch from Home",
    description: "Schedule a pickup or delivery directly from your home or location.",
    href: "/dispatch-from-home",
    cta: "Dispatch Now",
    comingSoon: false,
  },
  {
    icon: MessageCircle,
    label: "Get Support",
    description: "Questions about your application, delivery, or account? We're here.",
    href: "/contact",
    cta: "Contact Us",
    comingSoon: false,
  },
];

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background gradients */}
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-sky-600/10 blur-[120px]" />
          <div className="absolute top-20 -right-40 h-[400px] w-[500px] rounded-full bg-cyan-500/8 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-content px-4 pt-16 pb-10 sm:px-6 sm:pt-20 lg:px-8">
          {/* Eyebrow + headline */}
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-sky-400">
              Welcome to SLYDE
            </p>
            <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Join Jamaica&apos;s New Delivery Infrastructure
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Earn independently as a Slyder or power deliveries for your business — built for Jamaica first and designed to scale.
            </p>
          </div>

          {/* Trust strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {trustItems.map((item, i) => (
              <div key={item.label} className="flex items-center gap-2">
                {i > 0 && <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />}
                <span className="text-xs font-medium text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Primary conversion cards ── */}
      <section className="relative z-10 mx-auto max-w-content px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">

          {/* ── Slyder Card (strongest) ── */}
          <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-sky-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-7 shadow-[0_0_60px_-10px_rgba(14,165,233,0.18)] sm:p-9">
            {/* Glow accent */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-500/10 blur-[80px]" />

            <div className="relative">
              {/* Badge + icon row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/15 text-sky-400">
                  <Truck className="h-7 w-7" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
                  Founding spots open
                </span>
              </div>

              {/* Copy */}
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-400">
                For Couriers
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
                Become a Founding Slyder
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Join the first wave of SLYDE couriers and reserve your activation spot before public launch. Set your own hours, work your area, and grow with a network built for Jamaica.
              </p>

              {/* Founding counter */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-medium text-slate-300">{SLYDER_SPOT_COUNT} / {SLYDER_SPOT_TOTAL} spots reserved</span>
                  <span>{SLYDER_PCT}% filled</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                    style={{ width: `${SLYDER_PCT}%` }}
                  />
                </div>
              </div>

              {/* Reassurance */}
              <p className="mt-4 text-xs text-slate-500">
                No documents required at this step &middot; Takes under 30 seconds &middot; WhatsApp updates included
              </p>

              {/* CTAs */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/join/slyder"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_4px_24px_-6px_rgba(14,165,233,0.55)] transition duration-200 hover:-translate-y-0.5 hover:bg-sky-400"
                  // TODO: analytics hook — entrance_slyder_cta_clicked
                >
                  Reserve My Spot
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/become-a-slyder"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-300 transition duration-200 hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>

          {/* ── Merchant Card ── */}
          <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-gradient-to-b from-slate-900/80 to-slate-950 p-7 shadow-soft sm:p-9">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/8 blur-[80px]" />

            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
                  <Network className="h-7 w-7" />
                </div>
                <span className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Fleet partners
                </span>
              </div>

              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-400">
                For Fleet Owners
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
                Register a Fleet or Delivery Company
              </h2>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-400">
                Share your vehicle capacity, operating areas, and partnership interest if you manage drivers, vehicles, or courier operations.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {["Fleet capacity", "Driver teams", "Transfer partners", "Final-mile support"].map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Built for company owners, courier operators, and fleet coordinators.
              </p>

              <div className="mt-7">
                <Link
                  href="/join/fleet"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_4px_24px_-6px_rgba(16,185,129,0.45)] transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-400"
                >
                  Register Fleet Interest
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-gradient-to-b from-slate-900/80 to-slate-950 p-7 shadow-soft sm:p-9">
            <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/8 blur-[80px]" />

            <div className="relative">
              {/* Badge + icon row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-400">
                  <Building2 className="h-7 w-7" />
                </div>
                <span className="inline-flex items-center rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Early merchant access
                </span>
              </div>

              {/* Copy */}
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400">
                For Businesses
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
                Become a Founding Merchant
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Get priority onboarding and launch benefits for your business before the SLYDE network opens publicly. Structured dispatch, no fleet required.
              </p>

              {/* Audience tags */}
              <div className="mt-5 flex flex-wrap gap-2">
                {["Stores", "Restaurants", "Online sellers", "Growing businesses"].map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Reassurance */}
              <p className="mt-4 text-xs text-slate-500">
                No commitment required at this step &middot; Full onboarding comes after &middot; WhatsApp-first updates
              </p>

              {/* CTAs */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/join/merchant"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-800 px-6 py-3.5 text-sm font-semibold text-white ring-1 ring-white/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-700"
                  // TODO: analytics hook — entrance_merchant_cta_clicked
                >
                  Register My Business
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/for-businesses"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-300 transition duration-200 hover:-translate-y-0.5 hover:bg-white/10"
                >
                  View Business Benefits
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Secondary actions ── */}
      <section className="mx-auto max-w-content px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 mt-4">
          <p className="text-sm font-semibold text-slate-400">More ways to use SLYDE</p>
          <p className="mt-1 text-xs text-slate-600">Already connected with us? Choose one of the quick actions below.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {secondaryActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col rounded-[1.5rem] border border-slate-800 bg-slate-900/60 p-5 transition duration-200 hover:border-slate-700 hover:bg-slate-900"
              // TODO: analytics hook — entrance_secondary_action_clicked({ action: action.label })
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400">
                <action.icon className="h-4.5 w-4.5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-300">{action.label}</p>
              <p className="mt-1.5 flex-1 text-xs leading-5 text-slate-500">{action.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition group-hover:text-slate-300">
                {action.cta}
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>

        {/* Footer browse link */}
        <p className="mt-10 text-center text-xs text-slate-600">
          Prefer to browse first?{" "}
          <Link href="/about" className="text-slate-500 underline underline-offset-2 hover:text-slate-400">
            Explore the full SLYDE site
          </Link>
        </p>
      </section>
    </div>
  );
}
