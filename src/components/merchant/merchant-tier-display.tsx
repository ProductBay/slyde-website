"use client";

import { CheckCircle2, Clock, Gift } from "lucide-react";

interface MerchantTierDisplayProps {
  selectedTier: "lite" | "business" | "enterprise";
}

const MERCHANT_TIERS = [
  {
    id: "lite",
    name: "Merchant Lite",
    description: "Perfect for getting started",
    price: "$29",
    period: "/month",
    features: [
      "Up to 100 orders/month",
      "Basic analytics dashboard",
      "Email support",
      "Standard delivery routing",
      "Basic API access",
    ],
    color: "slate",
  },
  {
    id: "business",
    name: "Business",
    description: "For growing merchants",
    price: "$79",
    period: "/month",
    features: [
      "Up to 500 orders/month",
      "Advanced analytics",
      "Priority email & chat support",
      "Optimized delivery routing",
      "Full API access",
      "Custom integrations",
      "Dedicated account manager",
    ],
    color: "blue",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For high-volume operations",
    price: "Custom",
    period: "pricing",
    features: [
      "Unlimited orders",
      "Custom analytics & reporting",
      "24/7 phone & dedicated support",
      "AI-powered routing optimization",
      "Advanced API features",
      "White-label options",
      "Enterprise SLA",
      "Dedicated infrastructure",
    ],
    color: "purple",
  },
];

export function MerchantTierDisplay({
  selectedTier,
}: MerchantTierDisplayProps) {
  return (
    <section className="space-y-4">
      {/* Hero Section - 60 Day Trial Offer */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-0.5">
        <div className="relative rounded-[calc(1.5rem-2px)] bg-white p-6 md:p-8">
          <div className="text-center space-y-5">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-50 blur-xl" />
                <div className="relative bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full p-4">
                  <Gift className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl font-black text-slate-900 md:text-5xl">
                60 Days
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Completely Free
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-slate-600">
                Early onboarding bonus for joining SLYDE network
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
              {[
                { icon: "✓", label: "No credit card" },
                { icon: "⚡", label: "Full features" },
                { icon: "🔄", label: "Cancel anytime" },
                { icon: "📈", label: "Scale freely" },
              ].map((prop, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 rounded-lg bg-slate-50 p-3">
                  <span className="text-2xl">{prop.icon}</span>
                  <span className="text-xs font-semibold text-slate-700 text-center">
                    {prop.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-sm text-slate-600 pt-2">
              ✨ Join 500+ merchants already saving with early access
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">After Trial Pricing Snapshot</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {MERCHANT_TIERS.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <div
                key={tier.id}
                className={`rounded-xl border p-4 ${
                  isSelected
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{tier.name}</p>
                  {isSelected ? <CheckCircle2 className="h-4 w-4 text-blue-600" /> : null}
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">{tier.price}</p>
                <p className="text-xs text-slate-500">{tier.period}</p>
                {isSelected ? (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                    <Clock className="h-3 w-3" />
                    Trial default
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] text-slate-500">Available after trial</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 border-2 border-blue-200 p-8">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "🚀",
              title: "Launch Fast",
              desc: "Get live in minutes, not weeks. No setup fees.",
            },
            {
              icon: "📊",
              title: "Test & Learn",
              desc: "Full analytics & insights to understand what works.",
            },
            {
              icon: "💰",
              title: "Zero Risk",
              desc: "No hidden charges. Cancel your trial anytime.",
            },
          ].map((benefit, idx) => (
            <div key={idx} className="space-y-3 text-center">
              <span className="text-4xl block">{benefit.icon}</span>
              <h4 className="font-bold text-slate-900">{benefit.title}</h4>
              <p className="text-sm text-slate-600">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
