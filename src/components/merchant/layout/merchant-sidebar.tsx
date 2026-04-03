"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Headset, House, MapPinned, PackagePlus, Settings2, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/merchant/dashboard", label: "Dashboard", icon: House },
  { href: "/merchant/dispatch/new", label: "New Dispatch", icon: PackagePlus },
  { href: "/merchant/orders", label: "Orders", icon: Building2 },
  { href: "/merchant/deliveries", label: "Deliveries", icon: Truck },
  { href: "/merchant/addresses", label: "Addresses", icon: MapPinned },
  { href: "/merchant/settings", label: "Settings", icon: Settings2 },
  { href: "/merchant/support", label: "Support", icon: Headset },
];

export function MerchantSidebar({
  businessName,
  logoUrl,
}: {
  businessName?: string;
  logoUrl?: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 flex-col border-r border-slate-800 bg-[linear-gradient(180deg,#020617_0%,#0f172a_45%,#111827_100%)] px-6 py-8 text-white lg:flex">
      <div className="space-y-3">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
          Merchant Workspace
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={`${businessName || "Merchant"} logo`} className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-semibold text-cyan-100">{(businessName || "S").slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">SLYDE Merchant Ops</h1>
            <p className="mt-1 text-sm font-medium text-cyan-100">{businessName || "Merchant workspace"}</p>
          </div>
        </div>
        <div>
          <p className="text-sm leading-6 text-slate-300">
            Fast dispatching, delivery visibility, and operational control for merchants running through SLYDE.
          </p>
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white",
                active && "bg-white text-slate-950 shadow-soft",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Operator tip</p>
        <p className="mt-3 text-sm leading-6 text-slate-200">
          Use saved addresses and guided dispatch selections to keep requests cleaner for ops and faster for your team.
        </p>
        <Link href="/merchant/support" className="mt-4 inline-flex text-sm font-semibold text-cyan-200">
          Open support
        </Link>
      </div>
    </aside>
  );
}
