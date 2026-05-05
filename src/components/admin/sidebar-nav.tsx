"use client";

import { Bell, Gauge, Gift, Headset, Home, Layers3, MapPinned, RadioTower, ScrollText, Settings, Share2, Store, TrendingUp, Users, UserPlus, UserSquare2, Waypoints, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/site/brand-mark";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/residential", label: "Residential", icon: Home },
  { href: "/admin/users", label: "Registered Users", icon: Users },
  { href: "/admin/slyder-applications", label: "Slyder Applications", icon: UserSquare2 },
  { href: "/admin/slyder-leads", label: "Slyder Leads", icon: UserPlus },
  { href: "/admin/slyder-funnel", label: "Slyder Funnel", icon: TrendingUp },
  { href: "/admin/slyder-referrals", label: "Slyder Referrals", icon: Share2 },
  { href: "/admin/employee-applications", label: "Employee Applications", icon: UserSquare2 },
  { href: "/admin/merchant-leads", label: "Merchant Leads", icon: Store },
  { href: "/admin/merchant-applications", label: "Merchant Applications", icon: Store },
  { href: "/admin/partner-carriers", label: "Partner Carriers", icon: Waypoints },
  { href: "/admin/out-of-parish-deliveries", label: "Out-of-Parish", icon: Waypoints },
  { href: "/admin/slyders", label: "Approved Slyders", icon: Users },
  { href: "/admin/coverage-zones", label: "Coverage Zones", icon: MapPinned },
  { href: "/admin/network-readiness", label: "Network Readiness", icon: Layers3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/support", label: "Support Inbox", icon: Headset },
  { href: "/admin/referrals", label: "Public Referrals", icon: Gift },
  { href: "/admin/launch-control", label: "Launch Control", icon: RadioTower },
  { href: "/admin/legal-documents", label: "Legal Documents", icon: ScrollText },
  { href: "/admin/legal-acceptances", label: "Legal Acceptances", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({
  mobileOpen = false,
  onNavigate,
  onClose,
}: {
  mobileOpen?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition xl:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!mobileOpen}
      />
      <aside
        className={cn(
          "admin-sidebar fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[21rem] -translate-x-full transition-transform duration-300 xl:sticky xl:z-auto xl:w-auto xl:max-w-none xl:translate-x-0",
          mobileOpen && "translate-x-0",
        )}
      >
        <div className="flex items-center justify-between gap-3 px-1 xl:justify-start">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <BrandMark inverted compact />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-200">SLYDE Ops</p>
              <p className="text-lg font-semibold leading-none text-white">Control Tower</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 xl:hidden"
            aria-label="Close admin navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-8 grid min-h-0 flex-1 content-start gap-1.5 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const isActive = item.href === "/admin" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("admin-sidebar-link", isActive && "admin-sidebar-link-active")}
                onClick={onNavigate}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-5 shrink-0 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <Waypoints className="h-5 w-5 text-sky-300" />
            <p className="text-sm font-medium text-white">Region-by-region launch model</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Track readiness by parish and zone, then move stronger areas into launch control with clearer operational confidence.
          </p>
        </div>
      </aside>
    </>
  );
}
