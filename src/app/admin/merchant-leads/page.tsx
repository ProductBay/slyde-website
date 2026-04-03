import { AdminShell } from "@/components/admin/admin-shell";
import { MerchantLeadsTable } from "@/components/admin/merchant/merchant-table";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listMerchantLeadRows } from "@/modules/merchant/services/merchant-lead.service";
import type { MerchantLeadFilters } from "@/types/backend/onboarding";

export default async function AdminMerchantLeadsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const filters: MerchantLeadFilters = {
    status: typeof params.status === "string" ? (params.status as MerchantLeadFilters["status"]) : undefined,
    parish: typeof params.parish === "string" ? params.parish : undefined,
    productIntent: typeof params.productIntent === "string" ? (params.productIntent as MerchantLeadFilters["productIntent"]) : undefined,
    search: typeof params.search === "string" ? params.search : undefined,
  };

  const [{ user, mode }, rows] = await Promise.all([getAdminPageContext(), listMerchantLeadRows(filters)]);

  return (
    <AdminShell
      title="Merchant Leads"
      description="Review merchant lead submissions across GrabQuik and SLYDE delivery intent."
      adminName={user.fullName}
      mode={mode}
    >
      <MerchantLeadsTable rows={rows} filters={filters} />
    </AdminShell>
  );
}
