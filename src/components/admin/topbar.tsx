import { Bell, Search } from "lucide-react";

export function Topbar({
  title,
  description,
  adminName,
  mode,
}: {
  title: string;
  description?: string;
  adminName: string;
  mode: "authenticated" | "development";
}) {
  return (
    <div className="admin-topbar">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">SLYDE Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{description}</p> : null}
      </div>
      <div className="flex flex-col gap-3 lg:items-end">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="admin-search-shell">
            <Search className="h-4 w-4 text-slate-400" />
            <input className="admin-search-input" placeholder="Search applicants, zones, or notifications" />
          </label>
          <button className="admin-icon-button" type="button" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </button>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-soft">
          {adminName} · {mode === "development" ? "Development access" : "Admin session"}
        </div>
      </div>
    </div>
  );
}
