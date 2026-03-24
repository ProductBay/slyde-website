import type { ReactNode } from "react";
import Link from "next/link";
import { EmployeePortalSidebar } from "@/components/employee/employee-portal-sidebar";

export function EmployeePortalShell({
  children,
  employeeName,
  title,
  department,
}: {
  children: ReactNode;
  employeeName: string;
  title: string;
  department: string;
}) {
  return (
    <div className="employee-app-shell">
      <EmployeePortalSidebar />
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="employee-topbar">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Dedicated employee workspace</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Internal operations portal</h2>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200/90 bg-white/90 px-5 py-3 text-left shadow-soft sm:rounded-full sm:text-right">
            <p className="text-sm font-semibold text-slate-900">{employeeName}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
              {title} · {department}
            </p>
          </div>
        </header>
        <main className="section-shell flex-1 pb-10">{children}</main>
        <footer className="border-t border-slate-200/80 bg-white/75">
          <div className="section-shell flex flex-col gap-3 py-5 text-sm text-slate-500">
            <p>&copy; 2026 SLYDE. Internal employee operations portal.</p>
            <p>SLYDE is a company of A&apos;Dash Technologies, the parent company and sister brand of GrabQuik.</p>
            <p>Developed by Ashandie Powell.</p>
            <p>Located in Southfield, St. Elizabeth, Jamaica.</p>
            <p>
              Legal links:{" "}
              <Link href="/privacy" className="text-slate-700 transition hover:text-slate-950">
                Privacy
              </Link>
              {" / "}
              <Link href="/terms" className="text-slate-700 transition hover:text-slate-950">
                Terms
              </Link>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
