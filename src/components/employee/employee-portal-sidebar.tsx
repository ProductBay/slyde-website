"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, BriefcaseBusiness, CircleDollarSign, LayoutDashboard, Megaphone, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/employee/portal", label: "Overview", icon: LayoutDashboard },
  { href: "/employee/portal/guides", label: "Guides", icon: BookOpenText },
  { href: "/employee/portal/announcements", label: "Updates", icon: Megaphone },
  { href: "/employee/portal/pay", label: "Pay", icon: CircleDollarSign },
  { href: "/employee/portal/profile", label: "Profile", icon: UserCircle2 },
];

export function EmployeePortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="employee-sidebar">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/90">
          <BriefcaseBusiness className="h-3.5 w-3.5" />
          Employee Portal
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">SLYDE Staff Hub</h1>
          <p className="max-w-xs text-sm leading-6 text-slate-300">
            Internal onboarding, supervisor updates, payroll visibility, and role-specific operational guidance.
          </p>
        </div>
      </div>

      <nav className="space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/employee/portal" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={cn("employee-sidebar-link", isActive && "employee-sidebar-link-active")}>
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/80">Separation</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          This workspace is for SLYDE employees. Slyder courier onboarding and employee internal operations now live in separate portal domains.
        </p>
      </div>
    </aside>
  );
}
