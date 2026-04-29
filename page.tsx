import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getResidentialDispatchRequestDetails } from "@/modules/admin/residential-management/residential-admin.repository";
import { ResidentialRequestActions } from "@/components/admin/residential-request-actions";
import type { ResidentialDispatchStatus, ResidentialPaymentStatus } from "@prisma/client";

const STATUS_BADGE: Record<ResidentialDispatchStatus, { label: string; color: string }> = {
  submitted:       { label: "Submitted",       color: "bg-yellow-100 text-yellow-800" },
  payment_pending: { label: "Payment Pending",  color: "bg-orange-100 text-orange-800" },
  confirmed:       { label: "Confirmed",        color: "bg-blue-100 text-blue-800" },
  rider_assigned:  { label: "Rider Assigned",   color: "bg-indigo-100 text-indigo-800" },
  picked_up:       { label: "Picked Up",        color: "bg-purple-100 text-purple-800" },
  in_transit:      { label: "In Transit",       color: "bg-sky-100 text-sky-800" },
  delivered:       { label: "Delivered",        color: "bg-green-100 text-green-800" },
  failed:          { label: "Failed",           color: "bg-red-100 text-red-800" },
  cancelled:       { label: "Cancelled",        color: "bg-slate-100 text-slate-600" },
};

const PAYMENT_BADGE: Record<ResidentialPaymentStatus, { label: string; color: string }> = {
  pending:    { label: "Pending",    color: "text-yellow-600" },
  authorized: { label: "Authorized", color: "text-blue-600" },
  captured:   { label: "Captured",   color: "text-green-600" },
  failed:     { label: "Failed",     color: "text-red-600" },
  refunded:   { label: "Refunded",   color: "text-orange-600" },
  cancelled:  { label: "Cancelled",  color: "text-slate-500" },
};

export default async function DispatchRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ user, mode }, request] = await Promise.all([
    getAdminPageContext(),
    getResidentialDispatchRequestDetails(id),
  ]);

  if (!request) notFound();

  const statusInfo = STATUS_BADGE[request.status];
  const paymentInfo = PAYMENT_BADGE[request.paymentStatus];

  return (
    <AdminShell title="Dispatch Request" adminName={user.fullName} mode={mode}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin/residential/requests" className="text-sky-600 hover:text-sky-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dispatch Request</h1>
            <p className="font-mono text-sm text-slate-500">{request.referenceCode}</p>
          </div>
        </div>

        {/* Status + Actions */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex flex-wrap gap-6 items-center">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Dispatch Status</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Payment Status</p>
              <span className={`text-sm font-medium ${paymentInfo.color}`}>{paymentInfo.label}</span>
            </div>
          </div>
          {request.failureReason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              <span className="font-medium">Reason:</span> {request.failureReason}
            </div>
          )}
          <ResidentialRequestActions requestId={id} currentStatus={request.status} />
        </div>

        {/* Customer Info */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Customer</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div><dt className="font-medium text-slate-500">Name</dt><dd className="mt-0.5 text-slate-900">{request.lead?.fullName ?? "—"}</dd></div>
            <div><dt className="font-medium text-slate-500">Phone</dt><dd className="mt-0.5 text-slate-900">{request.lead?.phone ?? "—"}</dd></div>
            <div>
              <dt className="font-medium text-slate-500">Lead Reference</dt>
              <dd className="mt-0.5">
                {request.lead ? (
                  <Link href={`/admin/residential/leads/${request.leadId}`} className="font-mono text-sky-600 hover:text-sky-700 text-xs">
                    {request.lead.referenceCode}
                  </Link>
                ) : "—"}
              </dd>
            </div>
            <div><dt className="font-medium text-slate-500">Payment Method</dt><dd className="mt-0.5 text-slate-900">{request.paymentMethod.replace(/_/g, " ")}</dd></div>
          </dl>
        </div>

        {/* Route */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Route</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <p className="font-medium text-slate-500 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Pickup</p>
              <p className="text-slate-900">{request.pickupAddress}</p>
              <p className="text-slate-500">{request.pickupArea}, {request.pickupParish}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-slate-500 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Dropoff</p>
              <p className="text-slate-900">{request.dropoffAddress}</p>
              <p className="text-slate-500">{request.dropoffArea}, {request.dropoffParish}</p>
            </div>
          </div>
        </div>

        {/* Parcel */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Parcel Details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
            <div><dt className="font-medium text-slate-500">Category</dt><dd className="mt-0.5 text-slate-900">{request.parcelCategory.replace(/_/g, " ")}</dd></div>
            <div><dt className="font-medium text-slate-500">Urgency</dt><dd className="mt-0.5 text-slate-900">{request.urgency}</dd></div>
            <div><dt className="font-medium text-slate-500">Preferred Window</dt><dd className="mt-0.5 text-slate-900">{request.preferredWindow ?? "—"}</dd></div>
          </dl>
          {request.parcelNotes && (
            <div className="mt-4 text-sm">
              <p className="font-medium text-slate-500">Notes</p>
              <p className="mt-0.5 text-slate-900">{request.parcelNotes}</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Timeline</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
            <div><dt className="font-medium text-slate-500">Submitted</dt><dd className="mt-0.5 text-slate-900">{new Date(request.submittedAt).toLocaleString()}</dd></div>
            <div><dt className="font-medium text-slate-500">Confirmed</dt><dd className="mt-0.5 text-slate-900">{request.confirmedAt ? new Date(request.confirmedAt).toLocaleString() : "—"}</dd></div>
            <div><dt className="font-medium text-slate-500">Picked Up</dt><dd className="mt-0.5 text-slate-900">{request.pickedUpAt ? new Date(request.pickedUpAt).toLocaleString() : "—"}</dd></div>
            <div><dt className="font-medium text-slate-500">Delivered</dt><dd className="mt-0.5 text-slate-900">{request.deliveredAt ? new Date(request.deliveredAt).toLocaleString() : "—"}</dd></div>
            <div><dt className="font-medium text-slate-500">Cancelled</dt><dd className="mt-0.5 text-slate-900">{request.cancelledAt ? new Date(request.cancelledAt).toLocaleString() : "—"}</dd></div>
          </dl>
        </div>

        {/* Event Log */}
        {request.events && request.events.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Event Log</h2>
            <ol className="space-y-3">
              {request.events.map((event) => (
                <li key={event.id} className="flex gap-4 text-sm">
                  <div className="text-xs text-slate-400 whitespace-nowrap pt-0.5 min-w-[120px]">
                    {new Date(event.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{event.title}</p>
                    {event.description && <p className="text-slate-500 text-xs mt-0.5">{event.description}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
