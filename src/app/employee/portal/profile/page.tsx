import { getEmployeePortalData } from "@/modules/employee/services/employee-portal.service";
import { getEmployeeSessionOrRedirect } from "@/server/employee/context";

export default async function EmployeeProfilePage() {
  const session = await getEmployeeSessionOrRedirect();
  const portal = await getEmployeePortalData(session.user.id);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="employee-paper p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Employee profile</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Internal profile summary</h1>
        <div className="mt-6 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
          <div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Employee code</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{portal.profile.employeeCode}</p>
          </div>
          <div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Department</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{portal.profile.department}</p>
          </div>
          <div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Title</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{portal.profile.title}</p>
          </div>
          <div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Manager</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{portal.manager?.fullName ?? "Not assigned"}</p>
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div className="handbook-rail-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Emergency contact</p>
          <p className="mt-3 text-sm font-semibold text-slate-950">{portal.profile.emergencyContactName ?? "Not provided"}</p>
          <p className="mt-1 text-sm text-slate-600">{portal.profile.emergencyContactPhone ?? "Not provided"}</p>
        </div>
        <div className="handbook-rail-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Portal status</p>
          <p className="mt-3 text-sm text-slate-700">
            {portal.profile.isOnboarded ? "Employee onboarding completed." : "Employee onboarding pending."}
          </p>
        </div>
      </div>
    </div>
  );
}
