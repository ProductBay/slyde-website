import Link from "next/link";
import { ArrowRight, BanknoteArrowDown, BellRing, BookOpenText, Users2 } from "lucide-react";
import { getEmployeePortalData } from "@/modules/employee/services/employee-portal.service";
import { getEmployeeSessionOrRedirect } from "@/server/employee/context";

function money(amount: number) {
  return new Intl.NumberFormat("en-JM", { style: "currency", currency: "JMD", maximumFractionDigits: 0 }).format(amount);
}

export default async function EmployeePortalPage() {
  const session = await getEmployeeSessionOrRedirect();
  const portal = await getEmployeePortalData(session.user.id);

  if (!portal.profile.isOnboarded) {
    return (
      <section className="section-shell py-10">
        <div className="employee-paper p-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Complete onboarding first</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            This employee account is active but still needs emergency contact and payout details before the full portal opens.
          </p>
          <Link href="/employee/onboarding" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
            Open employee onboarding
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="employee-hero-panel overflow-hidden p-8 lg:p-10">
        <div className="employee-hero-orb left-[-8%] top-[-12%] h-40 w-40" />
        <div className="employee-hero-orb bottom-[-16%] right-[-4%] h-48 w-48" />
        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_340px]">
          <div className="space-y-5">
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
              Employee dashboard
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-white lg:text-5xl">
              Internal updates, operating guides, and paycheck visibility in one workspace.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-200">
              This portal is built for SLYDE employees, including logistics operations staff. It centralizes handbook access, supervisor updates, payout visibility, and profile controls.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/70">Reporting line</p>
              <p className="mt-2 text-lg font-semibold text-white">{portal.manager?.fullName ?? "Manager not assigned"}</p>
              <p className="mt-2 text-sm text-slate-200">{portal.profile.locationLabel}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/70">Next paycheck</p>
              <p className="mt-2 text-lg font-semibold text-white">{portal.upcomingPayroll ? money(portal.upcomingPayroll.netAmount) : "Not available"}</p>
              <p className="mt-2 text-sm text-slate-200">Scheduled for {portal.upcomingPayroll?.payDate ?? "TBD"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Current net paycheck",
            value: portal.latestPayroll ? money(portal.latestPayroll.netAmount) : "N/A",
            detail: portal.latestPayroll ? `Pay date ${portal.latestPayroll.payDate}` : "No payroll records yet",
          },
          {
            label: "Latest payout",
            value: portal.latestPayout ? money(portal.latestPayout.amount) : "N/A",
            detail: portal.latestPayout ? `${portal.latestPayout.status} on ${portal.latestPayout.payoutDate}` : "No payouts yet",
          },
          {
            label: "Manager updates",
            value: `${portal.announcements.length}`,
            detail: "Visible announcements in your feed",
          },
          {
            label: "Assigned guides",
            value: `${portal.guides.length + 1}`,
            detail: "Role-aware documents and handbooks",
          },
        ].map((item) => (
          <div key={item.label} className="employee-paper p-6">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{item.value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="employee-paper p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Manager and supervisor updates</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Latest announcements</h2>
            </div>
            <Link href="/employee/portal/announcements" className="text-sm font-semibold text-cyan-700">
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-4">
            {portal.announcements.slice(0, 3).map((announcement) => (
              <article key={announcement.id} className="rounded-[1.6rem] border border-slate-200/80 bg-slate-50/70 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-slate-950">{announcement.title}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {announcement.priority}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{announcement.excerpt}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="handbook-rail-card">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Quick access</p>
            <div className="mt-4 space-y-3">
              <Link href="/employee/portal/guides/employee-handbook" className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                <span>Open employee handbook</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/employee/portal/pay" className="flex items-center justify-between rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-semibold text-slate-700">
                <span>Review pay and payouts</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/employee/portal/profile" className="flex items-center justify-between rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-semibold text-slate-700">
                <span>Update employee profile</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="handbook-rail-card">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <Users2 className="h-5 w-5" />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-950">{portal.profile.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Department: {portal.profile.department}. Employee code: {portal.profile.employeeCode}. Employment type: {portal.profile.employmentType.replace("_", " ")}.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
