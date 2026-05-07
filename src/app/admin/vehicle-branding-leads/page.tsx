import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { VehicleBrandingLeadsTable } from "@/components/admin/vehicle-branding/vehicle-branding-leads-table";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listVehicleBrandingLeads } from "@/modules/vehicle-branding/services/vehicle-branding.service";
import type { VehicleBrandingLeadStatus } from "@/modules/vehicle-branding/schemas/vehicle-branding.schema";

const PARISHES = [
  "Kingston", "St. Andrew", "St. Thomas", "Portland", "St. Mary", "St. Ann",
  "Trelawny", "St. James", "Hanover", "Westmoreland", "St. Elizabeth",
  "Manchester", "Clarendon", "St. Catherine",
];

const STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PRICING_SENT",
  "APPROVED",
  "SCHEDULED",
  "COMPLETED",
  "NOT_READY",
  "ARCHIVED",
];

export default async function AdminVehicleBrandingLeadsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const [{ user, mode }, leads] = await Promise.all([
    getAdminPageContext(),
    listVehicleBrandingLeads({
      status: typeof params.status === "string" ? (params.status as VehicleBrandingLeadStatus) : undefined,
      parish: typeof params.parish === "string" ? params.parish : undefined,
      q: typeof params.q === "string" ? params.q : undefined,
    }),
  ]);

  const serialized = leads.map((lead) => ({
    id: lead.id,
    fullName: lead.fullName,
    whatsapp: lead.whatsapp,
    email: lead.email,
    currentSlyderStatus: lead.currentSlyderStatus,
    vehicleType: lead.vehicleType,
    brandingInterest: lead.brandingInterest,
    parish: lead.parish,
    notes: lead.notes,
    status: lead.status,
    createdAt: lead.createdAt.toISOString(),
  }));
  const devAdminKey = mode === "development" ? process.env.SLYDE_ADMIN_DEV_KEY || "dev-admin-key" : undefined;

  return (
    <AdminShell
      title="Vehicle Branding Leads"
      description="Review SLYDE Verified Vehicle Branding interest submissions and follow up by WhatsApp."
      adminName={user.fullName}
      mode={mode}
    >
      <form className="mb-6" method="get">
        <FilterBar>
          <div className="grid flex-1 gap-3 md:grid-cols-3">
            <input
              className="field-input"
              name="q"
              placeholder="Search name, WhatsApp, or email"
              defaultValue={typeof params.q === "string" ? params.q : ""}
            />
            <select
              className="field-input"
              name="status"
              defaultValue={typeof params.status === "string" ? params.status : ""}
            >
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
              ))}
            </select>
            <select
              className="field-input"
              name="parish"
              defaultValue={typeof params.parish === "string" ? params.parish : ""}
            >
              <option value="">All parishes</option>
              {PARISHES.map((parish) => (
                <option key={parish} value={parish}>{parish}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="submit">
              Apply filters
            </button>
            <Link
              href="/admin/vehicle-branding-leads"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Reset
            </Link>
          </div>
        </FilterBar>
      </form>

      <VehicleBrandingLeadsTable leads={serialized} devAdminKey={devAdminKey} />
    </AdminShell>
  );
}
