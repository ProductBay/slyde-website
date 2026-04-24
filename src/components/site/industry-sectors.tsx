"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  UtensilsCrossed,
  ShoppingCart,
  Pill,
  Shirt,
  Cpu,
  Sparkles,
  Home,
  Building2,
  ArrowRight,
} from "lucide-react";

type Sector = {
  icon: React.ElementType;
  label: string;
  description: string;
  gradient: string;
  iconBg: string;
  href: string;
};

const sectors: Sector[] = [
  {
    icon: ShoppingBag,
    label: "Retail & E-commerce",
    description:
      "Same-day and on-demand delivery for online retailers, boutiques, and multi-location retail chains across Jamaica.",
    gradient: "from-sky-500 to-blue-600",
    iconBg: "bg-sky-50 text-sky-600",
    href: "/for-businesses",
  },
  {
    icon: UtensilsCrossed,
    label: "Restaurants & Catering",
    description:
      "Hot food, meal prep, and catering delivery with time-sensitive dispatch and delivery confirmation tracking.",
    gradient: "from-orange-500 to-red-600",
    iconBg: "bg-orange-50 text-orange-600",
    href: "/for-businesses",
  },
  {
    icon: ShoppingCart,
    label: "Grocery & Supermarkets",
    description:
      "High-frequency grocery runs and bulk order delivery for supermarkets, wholesalers, and specialty food stores.",
    gradient: "from-green-500 to-emerald-600",
    iconBg: "bg-green-50 text-green-600",
    href: "/for-businesses",
  },
  {
    icon: Pill,
    label: "Health & Pharmacy",
    description:
      "Medication and medical supply delivery with full accountability tracking for pharmacies and health distributors.",
    gradient: "from-teal-500 to-cyan-600",
    iconBg: "bg-teal-50 text-teal-600",
    href: "/for-businesses",
  },
  {
    icon: Shirt,
    label: "Fashion & Apparel",
    description:
      "Boutique-to-customer delivery with proof-of-delivery workflows for clothing, footwear, and accessories.",
    gradient: "from-purple-500 to-violet-600",
    iconBg: "bg-purple-50 text-purple-600",
    href: "/for-businesses",
  },
  {
    icon: Cpu,
    label: "Electronics & Tech",
    description:
      "Secure delivery for gadgets, accessories, and hardware with condition-verified handoffs and tracked custody.",
    gradient: "from-slate-600 to-slate-800",
    iconBg: "bg-slate-100 text-slate-700",
    href: "/for-businesses",
  },
  {
    icon: Sparkles,
    label: "Beauty & Wellness",
    description:
      "Salon product distribution, cosmetics delivery, and wellness order fulfillment with schedule-conscious dispatch.",
    gradient: "from-pink-500 to-rose-600",
    iconBg: "bg-pink-50 text-pink-600",
    href: "/for-businesses",
  },
  {
    icon: Home,
    label: "Home & Lifestyle",
    description:
      "Furniture accessories, home decor, and lifestyle goods delivered with size-aware job handling.",
    gradient: "from-amber-500 to-yellow-600",
    iconBg: "bg-amber-50 text-amber-600",
    href: "/for-businesses",
  },
  {
    icon: Building2,
    label: "B2B & Wholesale",
    description:
      "Business-to-business supply runs and bulk distribution across commercial districts and trade zones.",
    gradient: "from-indigo-500 to-blue-700",
    iconBg: "bg-indigo-50 text-indigo-600",
    href: "/for-businesses",
  },
];

export function IndustrySectors() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-shell px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mb-8 text-center sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
          Industries We Serve
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Built for the supply chains that move Jamaica
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-4 sm:text-base sm:leading-7">
          From restaurant orders to pharmaceutical runs, SLYDE is designed for the real delivery
          demands of Jamaican commerce.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
        {sectors.map((sector, i) => {
          const Icon = sector.icon;
          const isActive = active === i;

          return (
            <div
              key={sector.label}
              className="industry-sector-card group relative overflow-hidden rounded-[1.65rem] border border-slate-200/90 bg-white shadow-[0_20px_40px_-30px_rgba(15,23,42,0.24)] transition-shadow duration-300 hover:shadow-[0_28px_52px_-34px_rgba(15,23,42,0.28)]"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <div className="flex flex-col items-start gap-4 p-5 lg:hidden">
                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 ${sector.iconBg}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="space-y-2">
                  <p className="text-base font-semibold leading-snug text-slate-900">{sector.label}</p>
                  <p className="text-sm leading-6 text-slate-600">{sector.description}</p>
                </div>
                <Link
                  href={sector.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div
                className={`hidden flex-col items-start gap-4 p-6 transition-opacity duration-300 lg:flex ${
                  isActive ? "opacity-0" : "opacity-100"
                }`}
                aria-hidden={isActive}
              >
                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 ${sector.iconBg}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold leading-snug text-slate-900">{sector.label}</p>
              </div>

              <div
                className={`absolute inset-0 hidden flex-col justify-end bg-gradient-to-br ${sector.gradient} p-6 transition-transform duration-300 ease-out lg:flex ${
                  isActive ? "translate-y-0" : "translate-y-full"
                }`}
                aria-hidden={!isActive}
              >
                <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                  <Icon className="h-4 w-4 text-white" />
                </span>
                <p className="text-sm font-bold text-white">{sector.label}</p>
                <p className="mt-2 text-xs leading-5 text-white/85">{sector.description}</p>
                <Link
                  href={sector.href}
                  tabIndex={isActive ? 0 : -1}
                  className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/30"
                >
                  Learn more <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
