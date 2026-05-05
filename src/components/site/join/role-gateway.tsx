"use client";

import Link from "next/link";
import { ArrowRight, Building2, MapPin, Truck } from "lucide-react";

// TODO: analytics hook — role_gateway_selected

export function RoleGateway() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Slyder Card */}
      <Link
        href="/join/slyder"
        className="group relative flex flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-panel sm:p-8"
        onClick={() => {
          // TODO: analytics hook — role_gateway_selected({ role: "slyder" })
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
          <Truck className="h-6 w-6" />
        </div>
        <div className="mt-5 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">For Couriers</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Become a Slyder</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Earn independently with Jamaica&apos;s structured courier network. Set your own hours and delivery zones.
          </p>
        </div>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-glow transition duration-200 group-hover:-translate-y-0.5">
          Reserve My Founding Slyder Spot
          <ArrowRight className="h-4 w-4" />
        </div>
      </Link>

      {/* Merchant Card */}
      <Link
        href="/join/merchant"
        className="group relative flex flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-panel sm:p-8"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
          <Building2 className="h-6 w-6" />
        </div>
        <div className="mt-5 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">For Businesses</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Become a Merchant</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Use SLYDE to manage local deliveries for your business. Structured dispatch, no fleet required.
          </p>
        </div>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition duration-200 group-hover:-translate-y-0.5">
          Register My Business
          <ArrowRight className="h-4 w-4" />
        </div>
      </Link>

      {/* Explore Card */}
      <Link
        href="/about"
        className="group relative flex flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-panel sm:p-8"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
          <MapPin className="h-6 w-6" />
        </div>
        <div className="mt-5 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Learn More</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Explore SLYDE</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Learn how our logistics network works across Jamaica before committing to a role.
          </p>
        </div>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 group-hover:-translate-y-0.5">
          Learn More
          <ArrowRight className="h-4 w-4" />
        </div>
      </Link>
    </div>
  );
}
