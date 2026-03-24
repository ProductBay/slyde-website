import { getEmployeePortalData } from "@/modules/employee/services/employee-portal.service";
import { getEmployeeSessionOrRedirect } from "@/server/employee/context";

export default async function EmployeeAnnouncementsPage() {
  const session = await getEmployeeSessionOrRedirect();
  const portal = await getEmployeePortalData(session.user.id);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Announcements</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Manager and supervisor updates</h1>
      </div>
      {portal.announcements.map((announcement) => (
        <article key={announcement.id} className="employee-paper p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{announcement.title}</h2>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {announcement.priority}
            </span>
          </div>
          <p className="mt-4 text-lg leading-8 text-slate-700">{announcement.excerpt}</p>
          <p className="mt-4 text-sm leading-7 text-slate-600">{announcement.body}</p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Published {announcement.publishedAt}</p>
        </article>
      ))}
    </div>
  );
}
