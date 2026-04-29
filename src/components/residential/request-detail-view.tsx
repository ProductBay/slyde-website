"use client";

import type {
  ResidentialDispatchRequest,
  ResidentialRequestEvent,
} from "@prisma/client";

type RequestWithEvents = ResidentialDispatchRequest & {
  events: ResidentialRequestEvent[];
};

type LivePickupPin = {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  capturedAt: string | null;
  plainAddress: string;
};

function formatMoney(minor: number | null | undefined, currency = "JMD") {
  if (minor == null) return "-";
  return new Intl.NumberFormat("en-JM", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(minor / 100);
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-JM", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const statusLabels: Record<ResidentialDispatchRequest["status"], string> = {
  submitted: "Submitted",
  payment_pending: "Payment Pending",
  confirmed: "Confirmed",
  rider_assigned: "Rider Assigned",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  delivered: "Delivered",
  failed: "Failed",
  cancelled: "Cancelled",
};

const paymentStatusLabels: Record<
  ResidentialDispatchRequest["paymentStatus"],
  string
> = {
  pending: "Pending",
  authorized: "Authorized",
  captured: "Captured",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

const paymentMethodLabels: Record<
  ResidentialDispatchRequest["paymentMethod"],
  string
> = {
  wallet: "SLYDE Wallet",
  card: "Debit/Credit Card",
  slyde_gift_card: "SLYDE Gift Card",
  adash_scan_to_pay: "A'Dash Scan-to-Pay",
};

const statusColors: Record<ResidentialDispatchRequest["status"], string> = {
  submitted: "bg-slate-100 text-slate-700",
  payment_pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  rider_assigned: "bg-indigo-100 text-indigo-800",
  picked_up: "bg-violet-100 text-violet-800",
  in_transit: "bg-cyan-100 text-cyan-800",
  delivered: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-slate-200 text-slate-600",
};

const eventTypeColors: Record<string, string> = {
  submitted: "bg-slate-500",
  payment_authorized: "bg-blue-500",
  payment_captured: "bg-emerald-500",
  payment_failed: "bg-red-500",
  payment_refunded: "bg-orange-500",
  rider_assigned: "bg-indigo-500",
  pickup_confirmed: "bg-violet-500",
  in_transit: "bg-cyan-500",
  delivered: "bg-emerald-600",
  failed: "bg-red-600",
  cancelled: "bg-slate-400",
  note_added: "bg-slate-400",
};

export function RequestDetailView({ request, livePickupPin }: { request: RequestWithEvents; livePickupPin?: LivePickupPin | null }) {
  const hasEvents = request.events.length > 0;

  return (
    <div className="space-y-6">
      {/* Status + payment summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColors[request.status]}`}
          >
            {statusLabels[request.status]}
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment Status</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {paymentStatusLabels[request.paymentStatus]}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment Method</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {paymentMethodLabels[request.paymentMethod]}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatDate(request.submittedAt)}
          </p>
        </div>
      </div>

      {/* Route details */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Route Details</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Pickup</dt>
            <dd className="mt-1 text-sm text-slate-900">{request.pickupAddress}</dd>
            <dd className="text-xs text-slate-500">{request.pickupArea}, {request.pickupParish}</dd>
            {livePickupPin ? (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                <p className="font-semibold uppercase tracking-wide text-emerald-700">Live pickup pin</p>
                <p className="mt-1">Pinned address: {livePickupPin.plainAddress}</p>
                <p className="mt-1">
                  Coordinates: {livePickupPin.latitude.toFixed(6)}, {livePickupPin.longitude.toFixed(6)}
                </p>
                {livePickupPin.accuracyMeters != null ? <p className="mt-1">Accuracy: ~{livePickupPin.accuracyMeters} m</p> : null}
                {livePickupPin.capturedAt ? <p className="mt-1">Captured: {formatDate(livePickupPin.capturedAt)}</p> : null}
                <a
                  href={`https://www.google.com/maps?q=${livePickupPin.latitude},${livePickupPin.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex font-semibold text-emerald-800 underline underline-offset-2"
                >
                  Open pin in maps
                </a>
              </div>
            ) : null}
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Dropoff</dt>
            <dd className="mt-1 text-sm text-slate-900">{request.dropoffAddress}</dd>
            <dd className="text-xs text-slate-500">{request.dropoffArea}, {request.dropoffParish}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Parcel Category</dt>
            <dd className="mt-1 text-sm capitalize text-slate-900">
              {request.parcelCategory.replace(/_/g, " ")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Urgency</dt>
            <dd className="mt-1 text-sm capitalize text-slate-900">{request.urgency}</dd>
          </div>
          {request.parcelNotes && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Parcel Notes</dt>
              <dd className="mt-1 text-sm text-slate-900">{request.parcelNotes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Lifecycle timestamps */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Lifecycle</h2>
        <dl className="grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Confirmed</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(request.confirmedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Rider Assigned</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(request.riderAssignedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Picked Up</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(request.pickedUpAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Delivered</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(request.deliveredAt)}</dd>
          </div>
          {request.paymentReference && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Payment Ref</dt>
              <dd className="mt-1 font-mono text-xs text-slate-900">{request.paymentReference}</dd>
            </div>
          )}
          {request.failureReason && (
            <div className="sm:col-span-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-red-600">Failure Reason</dt>
              <dd className="mt-1 text-sm text-red-700">{request.failureReason}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Timeline / event audit log */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Timeline</h2>
        {!hasEvents ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No timeline events recorded yet. Events will appear here as your request progresses.
          </p>
        ) : (
          <ol className="relative ml-3 space-y-6 border-l border-slate-200 pl-6">
            {request.events.map((event) => (
              <li key={event.id} className="relative">
                <span
                  className={`absolute -left-[1.65rem] flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white ${eventTypeColors[event.eventType] ?? "bg-slate-400"}`}
                />
                <p className="text-xs text-slate-500">{formatDate(event.createdAt)}</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-950">{event.title}</p>
                {event.description && (
                  <p className="mt-0.5 text-sm text-slate-600">{event.description}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
