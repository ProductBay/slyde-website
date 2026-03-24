"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, Radar, X } from "lucide-react";
import { navItems } from "@/content/site";
import { BrandMark } from "@/components/site/brand-mark";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto flex max-w-shell items-center justify-between gap-3 rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(242,247,251,0.86))] px-4 py-3 shadow-panel backdrop-blur-xl sm:px-5 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-4 lg:px-6">
        <div className="flex items-center gap-3">
          <BrandMark compact />
          <div className="hidden items-center gap-2 rounded-full border border-sky-100 bg-sky-50/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700 2xl:inline-flex">
            <Radar className="h-3.5 w-3.5" />
            Launch surface
          </div>
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="flex min-w-0 max-w-full items-center gap-1 rounded-full border border-slate-200/80 bg-white/78 p-1.5 shadow-soft">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative whitespace-nowrap rounded-full px-2.5 py-2 text-[11px] font-semibold tracking-[0.01em] transition duration-200 xl:px-4 xl:py-2.5 xl:text-sm",
                  isActive(item.href) ? "bg-slate-950 text-white shadow-soft" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                )}
              >
                <span className="relative z-10">{item.label}</span>
                <span
                  className={cn(
                    "absolute inset-x-3 bottom-1 h-px rounded-full bg-gradient-to-r from-transparent via-sky-300 to-transparent transition-opacity duration-200",
                    isActive(item.href) ? "opacity-90" : "opacity-0 group-hover:opacity-70",
                  )}
                />
              </Link>
            ))}
          </div>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LinkButton href="/employee/login" variant="secondary" className="hidden h-11 px-5 text-[13px] 2xl:inline-flex xl:text-sm">
            Employee Portal
          </LinkButton>
          <LinkButton href="/become-a-slyder/apply" variant="secondary" className="hidden h-11 px-5 text-[13px] 2xl:inline-flex xl:text-sm">
            Apply as a Slyder
          </LinkButton>
          <LinkButton href="/employee/login" variant="secondary" className="h-10 px-4 text-[12px] xl:hidden">
            Employee
          </LinkButton>
          <LinkButton href="/become-a-slyder/apply" variant="secondary" className="h-10 px-4 text-[12px] xl:hidden">
            Apply
          </LinkButton>
          <LinkButton href="/for-businesses" className="h-10 px-4 text-[12px] xl:h-11 xl:px-5 xl:text-sm">
            Partner with SLYDE <ArrowUpRight className="h-4 w-4" />
          </LinkButton>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="mx-auto mt-3 max-w-shell rounded-[2rem] border border-white/60 bg-white/94 px-4 py-4 shadow-soft backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-sm font-medium transition",
                  isActive(item.href) ? "border-slate-900 bg-slate-950 text-white" : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50",
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <LinkButton href="/become-a-slyder/apply" variant="secondary" className="w-full">
              Apply as a Slyder
            </LinkButton>
            <LinkButton href="/employee/login" variant="secondary" className="w-full">
              Employee Portal
            </LinkButton>
            <LinkButton href="/for-businesses" className="w-full">
              Partner with SLYDE
            </LinkButton>
          </div>
        </div>
      ) : null}
    </header>
  );
}
