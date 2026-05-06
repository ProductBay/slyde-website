"use client";

import { useState, useRef, useCallback } from "react";
import { BriefcaseBusiness, UserRoundCheck, Sparkles, ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";

const businessReasons = [
  {
    title: "Skip fleet build-out",
    description: "Launch delivery operations without the overhead of recruiting, managing, and dispatching an internal fleet.",
  },
  {
    title: "Gain delivery visibility",
    description: "Monitor jobs through a tracked lifecycle instead of operating through blind handoffs and manual updates.",
  },
  {
    title: "Scale with demand",
    description: "Use SLYDE as a fulfillment layer that grows across order peaks, merchant expansion, and multi-zone operations.",
  },
  {
    title: "Build customer confidence",
    description: "Proof of delivery, live status updates, and clear operating controls improve the post-purchase experience.",
  },
];

const slyderReasons = [
  {
    title: "Faster payout-ready operations",
    description: "We are building payout support that helps eligible Slyders access earnings more smoothly and track payout status with greater clarity.",
  },
  {
    title: "Safer errand payment handling",
    description: "For errands requiring in-person purchases, SLYDE is designing proof-backed workflows that reduce confusion and improve accountability.",
  },
  {
    title: "Better earnings visibility",
    description: "Slyders should understand what they earned, what is pending, and how their payout setup supports day-to-day operations.",
  },
];

type CardId = "business" | "slyder";

export function NetworkFlipCards() {
  const [hovered, setHovered] = useState<CardId | null>(null);

  // Refs to measure back-face content height
  const businessBackRef = useRef<HTMLDivElement>(null);
  const slyderBackRef   = useRef<HTMLDivElement>(null);
  // Refs to the outer card articles so we can force their height
  const businessCardRef = useRef<HTMLDivElement>(null);
  const slyderCardRef   = useRef<HTMLDivElement>(null);

  const handleEnter = useCallback((id: CardId) => {
    setHovered(id);
    const backRef  = id === "business" ? businessBackRef : slyderBackRef;
    const cardRef  = id === "business" ? businessCardRef : slyderCardRef;
    if (backRef.current && cardRef.current) {
      // Measure the back face's natural height and pin the card to it
      const h = backRef.current.scrollHeight;
      cardRef.current.style.minHeight = `${h + 2}px`;
    }
  }, []);

  const handleLeave = useCallback(() => {
    setHovered(null);
    if (businessCardRef.current) businessCardRef.current.style.minHeight = "";
    if (slyderCardRef.current)   slyderCardRef.current.style.minHeight = "";
  }, []);

  return (
    <div className="network-flip-row">

      {/* ── Business card ── */}
      <article
        ref={businessCardRef}
        data-state={hovered === "business" ? "active" : hovered ? "inactive" : "default"}
        className="network-flip-card reveal-on-scroll"
        onMouseEnter={() => handleEnter("business")}
        onMouseLeave={handleLeave}
      >
        <div className={`network-flip-inner${hovered === "business" ? " is-flipped" : ""}`}>

          {/* Front */}
          <div className="network-flip-face network-flip-face-front">
            <div className="network-flip-shell">
              <div className="mb-6 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
                  <BriefcaseBusiness className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">For Businesses</p>
                  <h3 className="mt-0.5 text-lg font-semibold text-slate-950">Delivery without the fleet overhead</h3>
                </div>
              </div>
              <p className="text-sm leading-7 text-slate-600">
                Launch same-day and on-demand delivery without building your own internal fleet team.
              </p>
              <div className="mt-5 space-y-3">
                {businessReasons.map((item) => (
                  <div key={item.title} className="network-flip-point">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-sky-700" />
                    <p className="text-sm font-medium text-slate-700">{item.title}</p>
                  </div>
                ))}
              </div>
              <p className="mt-auto pt-6 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Hover to flip for deeper details
              </p>
            </div>
          </div>

          {/* Back */}
          <div ref={businessBackRef} className="network-flip-face network-flip-face-back">
            <div className="network-flip-shell">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Business details</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Built for merchants who need control and speed
              </h3>
              <div className="mt-5 space-y-3">
                {businessReasons.map((item, index) => (
                  <div
                    key={item.title}
                    className={`surface-card stagger-${index + 1} flex items-start gap-3 p-3.5`}
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sky-700">
                      <Sparkles className="h-2.5 w-2.5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-xs leading-6 text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-3">
                <LinkButton href="/for-businesses" className="w-full justify-center">
                  Partner with SLYDE <ArrowRight className="h-4 w-4" />
                </LinkButton>
                <LinkButton href="/contact" variant="secondary" className="w-full justify-center">
                  Talk to our team
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* ── Slyder card ── */}
      <article
        ref={slyderCardRef}
        data-state={hovered === "slyder" ? "active" : hovered ? "inactive" : "default"}
        className="network-flip-card reveal-on-scroll"
        onMouseEnter={() => handleEnter("slyder")}
        onMouseLeave={handleLeave}
      >
        <div className={`network-flip-inner${hovered === "slyder" ? " is-flipped" : ""}`}>

          {/* Front */}
          <div className="network-flip-face network-flip-face-front">
            <div className="network-flip-shell">
              <div className="mb-6 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
                  <UserRoundCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">For Slyders</p>
                  <h3 className="mt-0.5 text-lg font-semibold text-slate-950">A smarter path into delivery work</h3>
                </div>
              </div>
              <p className="text-sm leading-7 text-slate-600">
                Apply, verify, activate, and start working with more visibility, safer handling, and modern payout support.
              </p>
              <div className="mt-5 space-y-3">
                {slyderReasons.map((item) => (
                  <div key={item.title} className="network-flip-point">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-sky-700" />
                    <p className="text-sm font-medium text-slate-700">{item.title}</p>
                  </div>
                ))}
              </div>
              <p className="mt-auto pt-6 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Hover to flip for deeper details
              </p>
            </div>
          </div>

          {/* Back */}
          <div ref={slyderBackRef} className="network-flip-face network-flip-face-back">
            <div className="network-flip-shell">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Slyder details</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Operate with clearer earnings and safer workflows
              </h3>
              <div className="mt-5 space-y-3">
                {slyderReasons.map((item, index) => (
                  <div
                    key={item.title}
                    className={`surface-card stagger-${index + 1} flex items-start gap-3 p-3.5`}
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sky-700">
                      <Sparkles className="h-2.5 w-2.5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-xs leading-6 text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/join/slyder" className="flex-1 justify-center">
                  Join as a Slyder <ArrowRight className="h-4 w-4" />
                </LinkButton>
                <LinkButton href="/slyder-payouts" variant="secondary" className="flex-1 justify-center">
                  Learn about payouts
                </LinkButton>
              </div>
            </div>
          </div>

        </div>
      </article>
    </div>
  );
}
