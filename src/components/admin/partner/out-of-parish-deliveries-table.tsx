import Link from "next/link";
import { OutOfParishStatusBadge } from "@/components/merchant/deliveries/out-of-parish-status-badge";
import type { MerchantDelivery, MerchantOrder, PartnerCarrier, DeliveryTransferPlan } from "@/types/backend/onboarding";

export function OutOfParishDeliveriesTable({
  rows,
}: {
  rows: Array<{
    delivery: MerchantDelivery;
    order: MerchantOrder | null;
    transferPlan: DeliveryTransferPlan | null;
    partnerCarrier: PartnerCarrier | null;
  }>;
}) {
  if (!rows.length) {
    return <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-soft">No out-of-parish deliveries yet.</div>;
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Delivery</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Transfer partner</th>
              <th className="px-4 py-3 font-semibold">Destination</th>
              <th className="px-4 py-3 font-semibold">Overall status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.delivery.id} className="border-t border-slate-100">
                <td className="px-4 py-4 font-semibold text-slate-900">
                  <Link href={`/admin/out-of-parish-deliveries/${row.delivery.id}`} className="text-sky-700">
                    {row.order?.orderNumber ?? row.delivery.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-4 text-slate-700">{row.order?.customerName ?? "Unknown"}</td>
                <td className="px-4 py-4 text-slate-700">{row.partnerCarrier?.name ?? "Pending"}</td>
                <td className="px-4 py-4 text-slate-700">
                  {row.transferPlan ? `${row.transferPlan.destinationParish}${row.transferPlan.destinationTown ? `, ${row.transferPlan.destinationTown}` : ""}` : "Pending"}
                </td>
                <td className="px-4 py-4">
                  {row.transferPlan ? <OutOfParishStatusBadge status={row.transferPlan.overallStatus} /> : <span className="text-slate-500">Pending</span>}
                </td>
                <td className="px-4 py-4 text-slate-700">{new Date(row.delivery.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
