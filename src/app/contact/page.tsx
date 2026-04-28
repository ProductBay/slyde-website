import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Cable,
  Clock3,
  Headset,
  Mail,
  MapPinned,
  MessageSquareText,
  Phone,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { HeroSection } from "@/components/site/hero-section";
import { InquiryForm } from "@/components/site/inquiry-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Contact",
  "Contact SLYDE for support, Slyder help, business partnerships, or API and integration discussions.",
  "/contact",
);

const contactPaths = [
  {
    title: "Slyder support",
    description: "Application status, onboarding guidance, activation help, and readiness follow-up.",
    icon: UserRoundCheck,
    tone: "sky",
  },
  {
    title: "Business partnerships",
    description: "Merchant onboarding, delivery planning, service expansion, and enterprise conversations.",
    icon: Building2,
    tone: "emerald",
  },
  {
    title: "API and integrations",
    description: "Platform connectivity, workflow design, webhook planning, and orchestration support.",
    icon: Cable,
    tone: "amber",
  },
] as const;

const contactOps = [
  {
    label: "Email",
    value: "info@slyde.app",
    href: "mailto:info@slyde.app",
    icon: Mail,
  },
  {
    label: "Phone",
    value: "8765947320",
    href: "tel:+18765947320",
    icon: Phone,
  },
  {
    label: "Office base",
    value: "Southfield, St. Elizabeth, Jamaica",
    href: "/coverage",
    icon: MapPinned,
  },
  {
    label: "Response routing",
    value: "Support and partnerships triaged through one intake lane",
    href: "/support",
    icon: Headset,
  },
] as const;

const contactSignals = [
  {
    title: "Structured response flow",
    description: "Requests are routed by support type so the right team can respond faster.",
    icon: MessageSquareText,
  },
  {
    title: "Business-safe intake",
    description: "Partnership and integration conversations follow the same secure intake standard.",
    icon: ShieldCheck,
  },
  {
    title: "Clear follow-up",
    description: "Use one entry point for support, partner contact, or onboarding questions.",
    icon: Clock3,
  },
] as const;

const toneClasses: Record<(typeof contactPaths)[number]["tone"], string> = {
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-orange-200 bg-orange-50 text-orange-700",
};

export default function ContactPage() {
  return (
    <>
      <HeroSection
        eyebrow="Contact"
        title="Reach SLYDE through one enterprise-ready support and partnership lane"
        description="Use this route for support, Slyder onboarding help, merchant partnership discussions, and API or integration conversations."
        actions={[
          { href: "#contact-form", label: "Send a Message" },
          { href: "/support", label: "Open Support", variant: "secondary" },
        ]}
      />
      <section className="mx-auto max-w-shell px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="surface-panel p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow-badge border-sky-100 bg-sky-50 text-sky-700">Contact Paths</p>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
                  Choose the route that matches your need
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  SLYDE uses one coordinated contact lane, but every inquiry still follows the right operational path.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-surface-1 px-4 py-3 text-xs leading-6 text-slate-500">
                Secure intake
                <br />
                Support, merchant, and API-ready
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {contactPaths.map(({ title, description, icon: Icon, tone }) => (
                <div
                  key={title}
                  className="rounded-[1.6rem] border border-slate-200 bg-surface-1 p-5 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.16)]"
                >
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${toneClasses[tone]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-panel p-6 sm:p-8">
            <p className="eyebrow-badge border-slate-200 bg-slate-50 text-slate-700">Direct Contact</p>
            <div className="mt-5 grid gap-3">
              {contactOps.map(({ label, value, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex items-start gap-4 rounded-[1.35rem] border border-slate-200 bg-surface-1 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {label}
                    </span>
                    <span className="mt-1 block text-sm font-medium leading-6 text-slate-900">{value}</span>
                  </span>
                  <ArrowRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="surface-panel p-6 sm:p-8">
            <p className="eyebrow-badge border-slate-200 bg-slate-50 text-slate-700">Service Standard</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              A cleaner support experience from the first message
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Whether you are reaching out as a Slyder, merchant, partner, or customer, this page is designed to move your request into the right workflow with less friction.
            </p>

            <div className="mt-6 grid gap-4">
              {contactSignals.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-[1.5rem] border border-slate-200 bg-surface-1 px-5 py-5"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.6rem] border border-slate-950 bg-slate-950 px-5 py-5 text-white">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sky-200">
                  <Headset className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold">Need direct support?</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    If your request is already active, you can also use the dedicated support route for faster follow-up and tracking.
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/support"
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14"
                    >
                      Open support
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="contact-form">
            <InquiryForm
              mode="contact"
              title="Send a message"
              description="Use this form for support or general contact. Merchant, operations, and integration conversations can also be routed here for direct follow-up."
              submitLabel="Send message"
              successHref="/success/contact"
            />
          </div>
        </div>
      </section>
    </>
  );
}
