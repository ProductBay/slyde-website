"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { StoredUser } from "@/types/backend/onboarding";

type QuickLink = { href: string; label: string; description: string; icon: string };

const quickLinks: QuickLink[] = [
  { href: "/track", label: "Track a parcel", description: "Enter your tracking code to see live delivery status.", icon: "📦" },
  { href: "/refer", label: "Refer a friend", description: "Share your referral link and earn rewards.", icon: "🎁" },
  { href: "/support", label: "Get support", description: "Submit a request or browse help articles.", icon: "💬" },
  { href: "/coverage", label: "Coverage areas", description: "See which parishes and zones SLYDE serves.", icon: "📍" },
];

export function AccountDashboard({ user }: { user: StoredUser }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await fetch("/api/auth/user/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    });
  }

  const initials = user.fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="flex items-center justify-between rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-base font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-slate-950">{user.fullName}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
            {user.phone && <p className="text-xs text-slate-400">{user.phone}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isPending}
          className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
        >
          {isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Quick links</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {quickLinks.map(({ href, label, description, icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-start gap-3.5 rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-base border border-slate-100">
                {icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950">{label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
