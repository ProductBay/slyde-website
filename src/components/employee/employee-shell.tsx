import type { ReactNode } from "react";
import { EmployeeSidebar } from "@/components/employee/employee-sidebar";

export function EmployeeShell({
  children,
  userName,
  profileLabel,
}: {
  children: ReactNode;
  userName: string;
  profileLabel: string;
}) {
  return (
    <div className="employee-app-shell">
      <EmployeeSidebar />
      <div className="min-w-0">
        <header className="employee-topbar">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Internal workspace</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Employee knowledge hub</h2>
          </div>
          <div className="rounded-full border border-slate-200/90 bg-white/90 px-5 py-3 text-right shadow-soft">
            <p className="text-sm font-semibold text-slate-900">{userName}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">{profileLabel}</p>
          </div>
        </header>
        <main className="section-shell pb-10">{children}</main>
      </div>
    </div>
  );
}
