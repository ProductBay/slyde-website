"use client";

import { Bell, Gauge, Layers3, MapPinned, RadioTower, ScrollText, Users, UserSquare2, Waypoints } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/site/brand-mark";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/slyder-applications", label: "Slyder Applications", icon: UserSquare2 },
  { href: "/admin/employee-applications", label: "Employee Applications", icon: UserSquare2 },
  { href: "/admin/slyders", label: "Approved Slyders", icon: Users },
  { href: "/admin/coverage-zones", label: "Coverage Zones", icon: MapPinned },
  { href: "/admin/network-readiness", label: "Network Readiness", icon: Layers3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/launch-control", label: "Launch Control", icon: RadioTower },
  { href: "/admin/legal-documents", label: "Legal Documents", icon: ScrollText },
  { href: "/admin/legal-acceptances", label: "Legal Acceptances", icon: ScrollText },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="flex items-center gap-3 px-1">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          <BrandMark inverted compact />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.24em] text-sky-200">SLYDE Ops</p>
          <p className="text-lg font-semibold leading-none text-white">Control Tower</p>
        </div>
      </div>
      <nav className="mt-8 grid gap-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("admin-sidebar-link", isActive && "admin-sidebar-link-active")}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <Waypoints className="h-5 w-5 text-sky-300" />
          <p className="text-sm font-medium text-white">Region-by-region launch model</p>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Track readiness by parish and zone, then move stronger areas into launch control with clearer operational confidence.
        </p>
      </div>
    </aside>
  );
}
