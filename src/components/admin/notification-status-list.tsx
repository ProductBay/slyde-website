import { ActionModal } from "@/components/admin/action-modal";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import type { AdminNotificationView } from "@/types/admin";

export function NotificationStatusList({
  items,
  allowResend = false,
}: {
  items: AdminNotificationView[];
  allowResend?: boolean;
}) {
  return (
    <DataTable>
      <table className="min-w-[44rem] divide-y divide-slate-200">
        <thead className="bg-slate-50/90">
          <tr>
            <TableHeaderCell>Applicant</TableHeaderCell>
            <TableHeaderCell>Channel</TableHeaderCell>
            <TableHeaderCell>Recipient</TableHeaderCell>
            <TableHeaderCell>Template</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Sent At</TableHeaderCell>
            {allowResend ? <TableHeaderCell>Actions</TableHeaderCell> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {items.map((item) => (
            <tr key={item.id}>
              <TableCell className="font-medium text-slate-950">{item.applicantName}</TableCell>
              <TableCell>{item.channel}</TableCell>
              <TableCell className="max-w-[16rem] break-words">{item.recipient}</TableCell>
              <TableCell className="max-w-[12rem] break-words">{item.template}</TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell>{new Date(item.createdAt).toLocaleString("en-JM")}</TableCell>
              {allowResend ? (
                <TableCell>
                  <ActionModal
                    triggerLabel="Resend"
                    title="Resend notification"
                    description="Create a new notification attempt using the same channel, recipient, and template."
                    endpoint={`/api/admin/notifications/${item.id}/resend`}
                    payload={{}}
                    confirmLabel="Resend notification"
                    kind="resend"
                  />
                </TableCell>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}
