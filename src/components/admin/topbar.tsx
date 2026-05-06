"use client";

import { Menu, Search } from "lucide-react";
import { AdminLiveBell } from "@/components/admin/admin-live-bell";

export function Topbar({
  title,
  description,
  adminName,
  mode,
  onMenuToggle,
}: {
  title: string;
  description?: string;
  adminName: string;
  mode: "authenticated" | "development";
  onMenuToggle?: () => void;
}) {
  return (
    <div className="admin-topbar">
      <div className="min-w-0">
        <div className="flex items-start gap-3">
          <button className="admin-icon-button shrink-0 xl:hidden" type="button" aria-label="Open admin navigation" onClick={onMenuToggle}>
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">SLYDE Admin</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p> : null}
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <label className="admin-search-shell">
            <Search className="h-4 w-4 text-slate-400" />
            <input className="admin-search-input" placeholder="Search applicants, zones, or notifications" />
          </label>
          <AdminLiveBell />
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-soft">
          {adminName} · {mode === "development" ? "Development access" : "Admin session"}
        </div>
      </div>
    </div>
  );
}
