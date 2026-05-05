import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { SlyderLeadsTable } from "@/components/admin/slyder-leads-table";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listSlyderLeads } from "@/modules/leads/services/slyder-lead.service";

const PARISHES = [
  "Kingston", "St. Andrew", "St. Thomas", "Portland", "St. Mary", "St. Ann",
  "Trelawny", "St. James", "Hanover", "Westmoreland", "St. Elizabeth",
  "Manchester", "Clarendon", "St. Catherine",
];

const STATUSES = [
  "NEW", "QUALIFIED", "NURTURING", "STARTED_APPLICATION", "ABANDONED",
  "SUBMITTED", "UNDER_REVIEW", "APPROVED", "ACTIVATED", "LIVE", "REJECTED",
];

export default async function AdminSlyderLeadsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const [{ user, mode }, leads] = await Promise.all([
    getAdminPageContext(),
    listSlyderLeads({
      status: typeof params.status === "string" ? (params.status as "NEW") : undefined,
      parish: typeof params.parish === "string" ? params.parish : undefined,
      vehicleType: typeof params.vehicleType === "string" ? params.vehicleType : undefined,
      q: typeof params.q === "string" ? params.q : undefined,
    }),
  ]);

  const serialized = leads.map((lead) => ({
    id: lead.id,
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    whatsapp: lead.whatsapp,
    parish: lead.parish,
    vehicleType: lead.vehicleType,
    status: lead.status,
    referralCode: lead.referralCode,
    qualificationScore: lead.qualificationScore,
    actionCenterTitle: lead.actionCenterTitle,
    actionCenterBody: lead.actionCenterBody,
    actionCenterCtaLabel: lead.actionCenterCtaLabel,
    actionCenterCtaHref: lead.actionCenterCtaHref,
    createdAt: lead.createdAt.toISOString(),
  }));
  const devAdminKey = mode === "development" ? process.env.SLYDE_ADMIN_DEV_KEY || "dev-admin-key" : undefined;

  return (
    <AdminShell
      title="Slyder Leads"
      description="Leads captured from /join/slyder before full application. Filter, contact on WhatsApp, and track qualification status."
      adminName={user.fullName}
      mode={mode}
    >
      <form className="mb-6" method="get">
        <FilterBar>
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input
              className="field-input"
              name="q"
              placeholder="Search name, email, or WhatsApp"
              defaultValue={typeof params.q === "string" ? params.q : ""}
            />
            <select
              className="field-input"
              name="status"
              defaultValue={typeof params.status === "string" ? params.status : ""}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
            <select
              className="field-input"
              name="parish"
              defaultValue={typeof params.parish === "string" ? params.parish : ""}
            >
              <option value="">All parishes</option>
              {PARISHES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              className="field-input"
              name="vehicleType"
              defaultValue={typeof params.vehicleType === "string" ? params.vehicleType : ""}
            >
              <option value="">All vehicle types</option>
              {["bicycle", "motorcycle", "car", "van", "walker", "other"].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              type="submit"
            >
              Apply filters
            </button>
            <Link
              href="/admin/slyder-leads"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Reset
            </Link>
          </div>
        </FilterBar>
      </form>

      <SlyderLeadsTable leads={serialized} devAdminKey={devAdminKey} />
    </AdminShell>
  );
}
