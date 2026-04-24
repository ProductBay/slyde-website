"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { navItems } from "@/content/site";
import { BrandMark } from "@/components/site/brand-mark";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/lib/utils";

const dailyWisdom = [
  {
    proverb: "Every mickle mek a muckle.",
    reflection: "Small, steady moves build something big.",
  },
  {
    proverb: "One one coco full basket.",
    reflection: "Consistent progress adds up faster than people think.",
  },
  {
    proverb: "Wi likkle but wi tallawah.",
    reflection: "You do not have to start big to move with strength.",
  },
  {
    proverb: "Trouble nuh set like rain.",
    reflection: "Hard moments pass, so keep your momentum.",
  },
  {
    proverb: "If yuh want good, yuh nose haffi run.",
    reflection: "Real progress takes effort, focus, and follow-through.",
  },
  {
    proverb: "Patient man ride donkey.",
    reflection: "Patience and persistence still carry you forward.",
  },
  {
    proverb: "Cockroach nuh business inna fowl fight.",
    reflection: "Stay in your lane and protect your energy for what matters.",
  },
  {
    proverb: "Cow noh know di use of him tail till him lose it.",
    reflection: "Value what is working for you and keep building on it.",
  },
];

function getDailyWisdomIndex(date: Date) {
  const utcMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNumber = Math.floor(utcMidnight / 86_400_000);
  return ((dayNumber % dailyWisdom.length) + dailyWisdom.length) % dailyWisdom.length;
}

const navSubmenus: Record<string, Array<{ href: string; label: string; description: string }>> = {
  "/about": [
    { href: "/about", label: "Our Story", description: "See the vision behind SLYDE." },
    { href: "/coverage", label: "Coverage", description: "Explore launch zones and rollout areas." },
    { href: "/faq", label: "FAQ", description: "Find quick answers about the platform." },
  ],
  "/become-a-slyder": [
    { href: "/become-a-slyder", label: "Overview", description: "Understand the Slyder opportunity." },
    { href: "/become-a-slyder/apply", label: "Apply Now", description: "Start your onboarding journey." },
    { href: "/slyder-payouts", label: "Slyder Payouts", description: "See how earnings and payouts work." },
    { href: "/grow-your-area", label: "Grow Your Area", description: "Help build readiness in your zone." },
  ],
  "/refer-a-slyder": [
    { href: "/refer-a-slyder", label: "Referral Network", description: "Learn how Slyder-Hook referrals work." },
    { href: "/refer-a-slyder/rewards", label: "Rewards", description: "See milestone-based referral rewards." },
    { href: "/refer-a-slyder/status", label: "Check Status", description: "Track referral progress and outcomes." },
    { href: "/refer/login", label: "Referral Login", description: "Access your referral dashboard." },
  ],
  "/for-businesses": [
    { href: "/for-businesses", label: "Business Overview", description: "See how SLYDE supports merchants and teams." },
    { href: "/for-businesses/slyde", label: "Merchant-Lite", description: "Plug delivery into your social store." },
    { href: "/for-businesses/status", label: "Track Page", description: "Monitor package and order visibility." },
    { href: "/api-integrations", label: "API / Integrations", description: "Explore partner and platform connectivity." },
  ],
};

function hasActiveChild(pathname: string, href: string) {
  const submenuItems = navSubmenus[href];
  return submenuItems?.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? false;
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [dailyIndex, setDailyIndex] = useState(0);
  const [todayLabel, setTodayLabel] = useState("");
  const pathname = usePathname();
  const tabletDesktopNavItems = navItems.filter((item) =>
    ["/", "/about", "/become-a-slyder", "/refer-a-slyder", "/for-businesses", "/safety", "/contact"].includes(item.href),
  );
  const wisdom = dailyWisdom[dailyIndex];

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href)) || hasActiveChild(pathname, href);

  useEffect(() => {
    const syncDailyWisdom = () => {
      const now = new Date();
      setDailyIndex(getDailyWisdomIndex(now));
      setTodayLabel(
        new Intl.DateTimeFormat("en-JM", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }).format(now),
      );
    };

    syncDailyWisdom();

    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const delay = nextMidnight.getTime() - now.getTime();

    let dailyInterval: number | undefined;
    const timer = window.setTimeout(() => {
      syncDailyWisdom();
      dailyInterval = window.setInterval(syncDailyWisdom, 86_400_000);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      if (dailyInterval) window.clearInterval(dailyInterval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,252,0.9))] shadow-[0_16px_44px_-34px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      <div className="border-b border-sky-200/70 bg-[linear-gradient(90deg,rgba(6,23,47,0.98),rgba(7,37,66,0.94),rgba(11,64,94,0.9))] px-4 py-2 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200/88">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.82)]" />
              Daily Yard Wisdom
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-sky-100/80 sm:text-xs">
              <span className="font-semibold text-white/92">Welcome to SLYDE</span>
              <span className="hidden h-1 w-1 rounded-full bg-sky-200/55 sm:inline-block" />
              <span>{todayLabel}</span>
            </div>
          </div>
          <div className="min-w-0 sm:max-w-[48rem] sm:text-right">
            <p className="truncate text-sm font-semibold text-white sm:text-[0.95rem]">
              {wisdom.proverb}
            </p>
            <p className="truncate text-[11px] text-sky-100/76 sm:text-xs">
              {wisdom.reflection}
            </p>
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-3 lg:px-8 lg:py-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <BrandMark compact />
          <div className="hidden min-w-0 border-l border-slate-200/80 pl-3 2xl:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-700">
              Jamaica-first
            </p>
            <p className="truncate text-[13px] font-medium text-slate-500">
              Delivery infrastructure for modern commerce
            </p>
          </div>
        </div>

        <nav className="hidden min-w-0 items-center justify-center lg:flex">
          <div className="flex min-w-0 max-w-full items-center gap-1 rounded-full border border-slate-200/80 bg-white/82 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_25px_-20px_rgba(15,23,42,0.35)] 2xl:hidden">
            {tabletDesktopNavItems.map((item) => {
              const submenuItems = navSubmenus[item.href];

              if (!submenuItems) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.01em] transition duration-200",
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
                );
              }

              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.01em] transition duration-200",
                      isActive(item.href) ? "bg-slate-950 text-white shadow-soft" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                    )}
                  >
                    <span className="relative z-10">{item.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-70 transition group-hover:opacity-100" />
                    <span
                      className={cn(
                        "absolute inset-x-3 bottom-1 h-px rounded-full bg-gradient-to-r from-transparent via-sky-300 to-transparent transition-opacity duration-200",
                        isActive(item.href) ? "opacity-90" : "opacity-0 group-hover:opacity-70",
                      )}
                    />
                  </Link>

                  <div className="pointer-events-none absolute left-1/2 top-full z-50 w-[17rem] -translate-x-1/2 pt-2 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                    <div className="absolute inset-x-0 top-0 h-3" aria-hidden />
                    <div className="rounded-[1.2rem] border border-slate-200/80 bg-white/96 p-2 shadow-[0_24px_55px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl">
                      {submenuItems.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className="group relative block overflow-hidden rounded-[0.95rem] px-3 py-2.5 transition duration-300 [transform-style:preserve-3d] [perspective:900px] hover:shadow-[0_18px_34px_-24px_rgba(15,23,42,0.3)]"
                        >
                          <span
                            aria-hidden
                            className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(115deg,rgba(14,165,233,0.14),rgba(34,211,238,0.12)_32%,rgba(249,115,22,0.14)_68%,rgba(132,204,22,0.12))] opacity-0 transition duration-300 group-hover:opacity-100 group-hover:[transform:translate3d(0,0,0)]"
                          />
                          <span
                            aria-hidden
                            className="absolute inset-y-0 left-[-35%] w-[42%] skew-x-[-22deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:animate-[navbarSubmenuSheen_850ms_ease_forwards]"
                          />
                          <span
                            aria-hidden
                            className="pointer-events-none absolute left-0 top-1/2 h-[72%] w-1 -translate-y-1/2 rounded-r-full bg-[linear-gradient(180deg,#38bdf8,#22d3ee,#f97316)] opacity-0 shadow-[0_0_18px_rgba(34,211,238,0.32)] transition duration-300 group-hover:opacity-100"
                          />
                          <span
                            aria-hidden
                            className="absolute inset-x-3 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.72),transparent)] opacity-0 transition duration-300 group-hover:opacity-100"
                          />
                          <div className="relative z-10 transition duration-300 [transform:translate3d(0,0,0)_rotateX(0deg)] group-hover:[transform:translate3d(0,-2px,12px)_rotateX(4deg)]">
                            <p className="text-[11px] font-semibold text-slate-900 transition duration-300 group-hover:text-slate-950">
                              {subitem.label}
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-slate-500 transition duration-300 group-hover:text-slate-700">
                              {subitem.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden min-w-0 max-w-full items-center gap-1 rounded-full border border-slate-200/80 bg-white/82 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_25px_-20px_rgba(15,23,42,0.35)] 2xl:flex">
            {navItems.map((item) => {
              const submenuItems = navSubmenus[item.href];

              if (!submenuItems) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.01em] transition duration-200",
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
                );
              }

              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.01em] transition duration-200",
                      isActive(item.href) ? "bg-slate-950 text-white shadow-soft" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                    )}
                  >
                    <span className="relative z-10">{item.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-70 transition group-hover:opacity-100" />
                    <span
                      className={cn(
                        "absolute inset-x-3 bottom-1 h-px rounded-full bg-gradient-to-r from-transparent via-sky-300 to-transparent transition-opacity duration-200",
                        isActive(item.href) ? "opacity-90" : "opacity-0 group-hover:opacity-70",
                      )}
                    />
                  </Link>

                  <div className="pointer-events-none absolute left-1/2 top-full z-50 w-[18rem] -translate-x-1/2 pt-2 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                    <div className="absolute inset-x-0 top-0 h-3" aria-hidden />
                    <div className="rounded-[1.2rem] border border-slate-200/80 bg-white/96 p-2 shadow-[0_24px_55px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl">
                      {submenuItems.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className="group relative block overflow-hidden rounded-[0.95rem] px-3 py-2.5 transition duration-300 [transform-style:preserve-3d] [perspective:900px] hover:shadow-[0_18px_34px_-24px_rgba(15,23,42,0.3)]"
                        >
                          <span
                            aria-hidden
                            className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(115deg,rgba(14,165,233,0.14),rgba(34,211,238,0.12)_32%,rgba(249,115,22,0.14)_68%,rgba(132,204,22,0.12))] opacity-0 transition duration-300 group-hover:opacity-100 group-hover:[transform:translate3d(0,0,0)]"
                          />
                          <span
                            aria-hidden
                            className="absolute inset-y-0 left-[-35%] w-[42%] skew-x-[-22deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:animate-[navbarSubmenuSheen_850ms_ease_forwards]"
                          />
                          <span
                            aria-hidden
                            className="pointer-events-none absolute left-0 top-1/2 h-[72%] w-1 -translate-y-1/2 rounded-r-full bg-[linear-gradient(180deg,#38bdf8,#22d3ee,#f97316)] opacity-0 shadow-[0_0_18px_rgba(34,211,238,0.32)] transition duration-300 group-hover:opacity-100"
                          />
                          <span
                            aria-hidden
                            className="absolute inset-x-3 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.72),transparent)] opacity-0 transition duration-300 group-hover:opacity-100"
                          />
                          <div className="relative z-10 transition duration-300 [transform:translate3d(0,0,0)_rotateX(0deg)] group-hover:[transform:translate3d(0,-2px,12px)_rotateX(4deg)]">
                            <p className="text-xs font-semibold text-slate-900 transition duration-300 group-hover:text-slate-950">
                              {subitem.label}
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-slate-500 transition duration-300 group-hover:text-slate-700">
                              {subitem.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <LinkButton href="/employee/login" variant="secondary" className="hidden h-9 px-3.5 text-xs 2xl:inline-flex">
            Employee Portal
          </LinkButton>
          <LinkButton href="/become-a-slyder/apply" variant="secondary" className="hidden h-9 px-3.5 text-xs 2xl:inline-flex">
            Apply as a Slyder
          </LinkButton>
          <LinkButton href="/for-businesses" className="h-9 px-4 text-xs xl:px-4">
            Partner with SLYDE <ArrowUpRight className="h-4 w-4" />
          </LinkButton>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-900 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.45)] lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="max-h-[calc(100vh-5.5rem)] w-full overflow-y-auto overscroll-contain border-t border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(246,249,252,0.94))] px-4 py-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:px-6 lg:hidden">
          <div className="mb-4 rounded-[1.4rem] border border-slate-200/80 bg-white/80 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-700">
              Jamaica-first
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Delivery infrastructure for couriers, merchants, and enterprise logistics teams.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {navItems.map((item) => {
              const submenuItems = navSubmenus[item.href];

              if (!submenuItems) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                      isActive(item.href) ? "border-slate-900 bg-slate-950 text-white" : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              }

              const expanded = mobileSubmenu === item.href;

              return (
                <div key={item.href} className="rounded-[1.35rem] border border-slate-200/80 bg-white/78">
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition",
                      isActive(item.href) ? "text-slate-950" : "text-slate-700",
                    )}
                    onClick={() => setMobileSubmenu((value) => (value === item.href ? null : item.href))}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className={cn("h-4 w-4 transition", expanded ? "rotate-180" : "")} />
                  </button>
                  {expanded ? (
                    <div className="border-t border-slate-200/80 px-3 py-2">
                      <Link
                        href={item.href}
                        className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                      {submenuItems.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className="block rounded-xl px-3 py-2 transition hover:bg-slate-50"
                          onClick={() => setOpen(false)}
                        >
                          <p className="text-sm font-medium text-slate-800">{subitem.label}</p>
                          <p className="mt-0.5 text-xs leading-5 text-slate-500">{subitem.description}</p>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}

            <div className="mt-2 grid gap-3">
              <LinkButton href="/for-businesses" className="w-full">
                Partner with SLYDE
              </LinkButton>
              <LinkButton href="/become-a-slyder/apply" variant="secondary" className="w-full">
                Apply as a Slyder
              </LinkButton>
              <LinkButton href="/employee/login" variant="secondary" className="w-full">
                Employee Portal
              </LinkButton>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        @keyframes navbarSubmenuSheen {
          from {
            transform: translateX(0) skewX(-22deg);
          }
          to {
            transform: translateX(320%) skewX(-22deg);
          }
        }
      `}</style>
    </header>
  );
}
