import { getEmployeePortalData } from "@/modules/employee/services/employee-portal.service";
import { getEmployeeSessionOrRedirect } from "@/server/employee/context";

function money(amount: number) {
  return new Intl.NumberFormat("en-JM", { style: "currency", currency: "JMD", maximumFractionDigits: 0 }).format(amount);
}

export default async function EmployeePayPage() {
  const session = await getEmployeeSessionOrRedirect();
  const portal = await getEmployeePortalData(session.user.id);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pay visibility</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Paycheck and payout records</h1>
        </div>
        <div className="employee-paper p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Payroll history</h2>
          <div className="mt-6 space-y-4">
            {portal.payrollRecords.map((record) => (
              <div key={record.id} className="rounded-[1.6rem] border border-slate-200/80 bg-slate-50/80 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-slate-950">
                    {record.payPeriodStart} to {record.payPeriodEnd}
                  </p>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {record.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
                  <p>Gross: <strong>{money(record.grossAmount)}</strong></p>
                  <p>Deductions: <strong>{money(record.deductionsAmount)}</strong></p>
                  <p>Net: <strong>{money(record.netAmount)}</strong></p>
                </div>
                <p className="mt-3 text-sm text-slate-600">Scheduled pay date: {record.payDate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div className="handbook-rail-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Payout account</p>
          <p className="mt-3 text-lg font-semibold text-slate-950">{portal.profile.payoutAccountMasked ?? "Not configured"}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Method: {portal.profile.payoutMethod.replace("_", " ")}</p>
        </div>
        <div className="handbook-rail-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Payout history</p>
          <div className="mt-4 space-y-3">
            {portal.payoutRecords.map((record) => (
              <div key={record.id} className="rounded-2xl border border-slate-200/80 px-4 py-3">
                <p className="text-sm font-semibold text-slate-950">{money(record.amount)}</p>
                <p className="mt-1 text-sm text-slate-600">{record.sourceLabel}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                  {record.status} · {record.payoutDate}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
