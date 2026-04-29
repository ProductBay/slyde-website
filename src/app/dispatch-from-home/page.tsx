import type { Metadata } from "next";
import Image from "next/image";
import {
  BadgeCheck,
  Clock3,
  Home,
  MapPin,
  Package,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { HeroSection } from "@/components/site/hero-section";
import { SectionHeading } from "@/components/site/section-heading";
import { InfoCardGrid } from "@/components/site/info-card-grid";
import { CTASection } from "@/components/site/cta-section";
import { LinkButton } from "@/components/ui/link-button";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Dispatch from Home",
  "Send packages, documents, and parcels from your home with SLYDE. Quick, reliable residential dispatching across Jamaica — no office, no hassle.",
  "/dispatch-from-home",
);

const howItWorks = [
  {
    eyebrow: "Step 1",
    title: "Submit your request",
    description:
      "Fill in your pickup address, where you are sending to, and what you are sending. Takes about two minutes.",
  },
  {
    eyebrow: "Step 2",
    title: "A Slyder is assigned",
    description:
      "We match your request to an available, verified Slyder in your area who picks up directly from your home.",
  },
  {
    eyebrow: "Step 3",
    title: "Track your delivery",
    description:
      "You receive updates as your parcel moves from pickup through to delivery confirmation.",
  },
  {
    eyebrow: "Step 4",
    title: "Pay your way",
    description:
      "Pay with SLYDE Wallet, debit/credit card, SLYDE Gift Card, or A'Dash scan-to-pay. No cash handling.",
  },
];

const features = [
  {
    title: "Pickup from your door",
    description: "No need to visit a courier office. A verified Slyder comes directly to your home address.",
    icon: Home,
  },
  {
    title: "Fast and local",
    description: "SLYDE is built for Jamaica. In-parish deliveries handled with knowledge of local routes.",
    icon: MapPin,
  },
  {
    title: "Multiple parcel types",
    description: "Documents, packages, fragile items, food, and more — handled appropriately for the parcel type.",
    icon: Package,
  },
  {
    title: "Verified Slyders",
    description: "Every Slyder passes identity review, document submission, and readiness checks before they go live.",
    icon: BadgeCheck,
  },
  {
    title: "Flexible payments",
    description: "Use SLYDE Wallet, debit/credit card, SLYDE Gift Card, or A'Dash scan-to-pay for secure payments.",
    icon: Wallet,
  },
  {
    title: "Managed entirely from your phone",
    description: "Request, track, and confirm — all from your phone without downloading anything to get started.",
    icon: Smartphone,
  },
  {
    title: "Transparent scheduling",
    description: "Request ASAP, today, or schedule a specific time window that works for you.",
    icon: Clock3,
  },
  {
    title: "Privacy first",
    description: "Your information is only used to process your delivery request. Nothing shared beyond what is needed.",
    icon: ShieldCheck,
  },
];

const faqItems = [
  {
    question: "Do I need an account to dispatch from home?",
    answer:
      "Yes. A SLYDE account is required for residential dispatching so each request is tied to your verified identity, wallet, and delivery timeline for security and accountability.",
  },
  {
    question: "How much does a delivery cost?",
    answer:
      "Pricing is based on distance, parcel type, and urgency. You will see an estimated fee before confirming and the final fee is confirmed once your Slyder accepts the request.",
  },
  {
    question: "What areas do you cover?",
    answer:
      "SLYDE is expanding parish by parish across Jamaica. When you submit your request, we check if your area is in our live coverage. If it is not yet live, we add you to our early-access list and notify you when we launch in your area.",
  },
  {
    question: "What happens after I submit?",
    answer:
      "Your request is reviewed and matched to an available Slyder. You will receive a WhatsApp or email update confirming when a Slyder is assigned and when pickup is scheduled.",
  },
  {
    question: "Can I send food or perishables?",
    answer:
      "Yes — select the Food / perishables category when booking. Add any handling notes such as keep cold or handle upright so the Slyder knows what to expect.",
  },
  {
    question: "What if my delivery fails?",
    answer:
      "If a delivery cannot be completed, you will be notified immediately with the reason and options to reattempt or collect the parcel.",
  },
];

export default function DispatchFromHomePage() {
  return (
    <>
      <HeroSection
        eyebrow="Residential dispatching"
        title="Send from home. No office required."
        description="Book a pickup directly from your home address. A verified SLYDE courier collects your parcel and delivers it where it needs to go — fast, trackable, and handled with care."
        supportText="Currently launching across Jamaica. Submit your request and we will confirm coverage."
        actions={[
          { href: "/dispatch-from-home/start", label: "Start a dispatch request", variant: "primary" },
          { href: "/coverage", label: "Check your area", variant: "secondary" },
        ]}
        metrics={[
          { value: "Door-to-door", label: "Pickup from your home, delivered to the recipient." },
          { value: "Account-secured", label: "Requests, progress, and wallet activity are linked to your account." },
          { value: "Verified couriers", label: "Every Slyder passes identity and readiness review." },
        ]}
      />

      {/* Delivery process visual */}
      <section className="section-shell py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-sky-600">
            The full delivery journey
          </p>
          <div className="overflow-hidden rounded-[2rem] shadow-panel ring-1 ring-slate-100">
            <Image
              src="/images/dispatch-how-it-works.png"
              alt="Six-step delivery journey: Order Dispatched, Slyder Accepts, Picked Up, On the Way, Almost There, Delivered"
              width={1200}
              height={800}
              className="w-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-shell py-10 sm:py-14">
        <SectionHeading
          eyebrow="How it works"
          title="Dispatch a parcel in four steps"
          description="From your front door to the recipient — the full process is designed to be simple, transparent, and handled for you."
          align="center"
        />
        <div className="mt-10">
          <InfoCardGrid items={howItWorks} columns="four" />
        </div>
      </section>

      {/* Features */}
      <section className="section-shell py-10 sm:py-14">
        <SectionHeading
          eyebrow="Why SLYDE for residential"
          title="Built around how you actually send"
          description="No queues. No offices. No guessing if your parcel arrived. SLYDE residential dispatching is built around how real people send parcels in Jamaica."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-[1.5rem] border border-white/60 bg-white/90 px-5 py-6 shadow-soft"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <f.icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-slate-950">{f.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section-shell py-10 sm:py-14">
        <SectionHeading
          eyebrow="Common questions"
          title="Answers about dispatching from home"
          align="center"
        />
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-slate-100 rounded-[1.75rem] border border-white/50 bg-white/90 shadow-panel">
          {faqItems.map((item) => (
            <div key={item.question} className="px-6 py-5">
              <p className="font-medium text-slate-950">{item.question}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <CTASection
        eyebrow="Ready to send?"
        title="Submit your first dispatch request"
        description="Takes about two minutes. We will match you to a verified Slyder in your area."
        actions={[
          { href: "/dispatch-from-home/start", label: "Start your request", variant: "primary" },
        ]}
      />
    </>
  );
}
