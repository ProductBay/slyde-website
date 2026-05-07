import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { VehicleBrandingDetailPanel } from "@/components/admin/vehicle-branding/vehicle-branding-detail-panel";
import { VehicleBrandingStatusBadge } from "@/components/admin/vehicle-branding/vehicle-branding-status-badge";

type Lead = {
  id: string;
  fullName: string;
  whatsapp: string;
  email: string | null;
  currentSlyderStatus: string | null;
  vehicleType: string | null;
  brandingInterest: string[];
  parish: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
};

function buildWhatsappUrl(whatsapp: string, fullName: string) {
  const phone = whatsapp.replace(/\D/g, "");
  const message = `Hi ${fullName}, this is SLYDE Logistics. Thanks for your interest in our Verified Vehicle Branding Program. We'd like to guide you through the available branding options and next steps.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function VehicleBrandingLeadsTable({ leads, devAdminKey }: { leads: Lead[]; devAdminKey?: string }) {
  if (!leads.length) {
    return (
      <EmptyState
        title="No vehicle branding leads found"
        description="Branding interest submissions appear here after Slyders submit the public form."
      />
    );
  }

  return (
    <DataTable>
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50/90">
          <tr>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>WhatsApp</TableHeaderCell>
            <TableHeaderCell>Slyder Status</TableHeaderCell>
            <TableHeaderCell>Vehicle Type</TableHeaderCell>
            <TableHeaderCell>Branding Interest</TableHeaderCell>
            <TableHeaderCell>Parish</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {leads.map((lead) => (
            <tr key={lead.id}>
              <TableCell className="min-w-52 font-medium text-slate-950">
                <div>{lead.fullName}</div>
                {lead.email ? <div className="mt-1 text-xs font-normal text-slate-500">{lead.email}</div> : null}
              </TableCell>
              <TableCell>{lead.whatsapp}</TableCell>
              <TableCell>{lead.currentSlyderStatus ?? "-"}</TableCell>
              <TableCell>{lead.vehicleType ?? "-"}</TableCell>
              <TableCell className="min-w-56">{lead.brandingInterest.length ? lead.brandingInterest.join(", ") : "-"}</TableCell>
              <TableCell>{lead.parish ?? "-"}</TableCell>
              <TableCell><VehicleBrandingStatusBadge status={lead.status} /></TableCell>
              <TableCell>{new Date(lead.createdAt).toLocaleDateString("en-JM")}</TableCell>
              <TableCell className="min-w-[23rem]">
                <div className="grid gap-3">
                  <a
                    href={buildWhatsappUrl(lead.whatsapp, lead.fullName)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-sky-700 hover:underline"
                  >
                    Open WhatsApp
                  </a>
                  <VehicleBrandingDetailPanel
                    leadId={lead.id}
                    currentStatus={lead.status}
                    currentNotes={lead.notes}
                    currentSlyderStatus={lead.currentSlyderStatus}
                    currentBrandingInterest={lead.brandingInterest}
                    devAdminKey={devAdminKey}
                  />
                </div>
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}
