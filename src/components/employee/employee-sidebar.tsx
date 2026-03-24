"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, ClipboardCheck, LayoutDashboard, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const hubLinks = [
  { href: "/employee-hub", label: "Overview", icon: LayoutDashboard },
  { href: "/employee-hub/handbook", label: "Handbook", icon: BookOpenText },
  { href: "/slyder/onboarding/setup", label: "Setup", icon: ClipboardCheck },
  { href: "/slyder/onboarding/legal", label: "Compliance", icon: ShieldCheck },
];

export function EmployeeSidebar() {
  const pathname = usePathname();

  return (
    <aside className="employee-sidebar">
      <div className="space-y-4">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/90">
          Employee Hub
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">SLYDE Field Desk</h1>
          <p className="max-w-xs text-sm leading-6 text-slate-300">
            Digital handbook access, onboarding continuity, and live role guidance for active team members.
          </p>
        </div>
      </div>

      <nav className="space-y-2">
        {hubLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/employee-hub" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("employee-sidebar-link", isActive && "employee-sidebar-link-active")}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/80">Access model</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          V1 access is available to active approved Slyder accounts, with role-based guide expansion scaffolded for broader staff roles.
        </p>
      </div>
    </aside>
  );
}
