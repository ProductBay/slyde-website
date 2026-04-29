"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Truck, MapPin, Clock } from "lucide-react";
import { getResidentialDispatchRequestDetails } from "@/modules/admin/residential-management/residential-admin.repository";
import {
  adminConfirmDispatchRequest,
  adminMarkPickedUp,
  adminMarkDelivered,
  adminCancelDispatchRequest,
  adminMarkFailed,
} from "@/modules/admin/residential-management/residential-admin.actions";
import type { ResidentialDispatchStatus } from "@prisma/client";

const STATUS_COLORS: Record<ResidentialDispatchStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_transit: "bg-purple-100 text-purple-800",
  picked_up: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-slate-100 text-slate-800",
  failed: "bg-red-100 text-red-800",
};

export default function DispatchRequestDetailPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showFailForm, setShowFailForm] = useState(false);

  const loadRequest = useCallback(async () => {
    try {
      const result = await getResidentialDispatchRequestDetails(params.id);
      setRequest(result);
    } catch (error) {
      console.error("Error loading request:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  // Load on mount
  useState(() => {
    loadRequest();
  });

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      const result = await adminConfirmDispatchRequest(params.id);
      if (result.success) {
        setRequest(result.request);
        alert("Request confirmed successfully");
      } else {
        alert(`Error: ${result.error}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handlePickedUp = async () => {
    setActionLoading(true);
    try {
      const result = await adminMarkPickedUp(params.id);
      if (result.success) {
        setRequest(result.request);
        alert("Request marked as picked up");
      } else {
        alert(`Error: ${result.error}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelivered = async () => {
    setActionLoading(true);
    try {
      const result = await adminMarkDelivered(params.id);
      if (result.success) {
        setRequest(result.request);
        alert("Request marked as delivered");
      } else {
        alert(`Error: ${result.error}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    setActionLoading(true);
    try {
      const result = await adminCancelDispatchRequest(params.id, cancelReason);
      if (result.success) {
        setRequest(result.request);
        setShowCancelForm(false);
        setCancelReason("");
        alert("Request cancelled successfully");
      } else {
        alert(`Error: ${result.error}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleFail = async () => {
    if (!failureReason.trim()) {
      alert("Please provide a failure reason");
      return;
    }

    setActionLoading(true);
    try {
      const result = await adminMarkFailed(params.id, failureReason);
      if (result.success) {
        setRequest(result.request);
        setShowFailForm(false);
        setFailureReason("");
        alert("Request marked as failed");
      } else {
        alert(`Error: ${result.error}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading request details...</div>;
  }

  if (!request) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/residential/requests" className="text-sky-600 hover:text-sky-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Request Not Found</h1>
        </div>
      </div>
    );
  }

  const getActionButtons = () => {
    const actions = [];
    const status = request.status as ResidentialDispatchStatus;

    if (status === "pending") {
      actions.push(
        <button
          key="confirm"
          onClick={handleConfirm}
          disabled={actionLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <CheckCircle className="h-4 w-4" />
          Confirm
        </button>
      );
    } else if (status === "confirmed" || status === "in_transit") {
      actions.push(
        <button
          key="picked-up"
          onClick={handlePickedUp}
          disabled={actionLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
        >
          <Truck className="h-4 w-4" />
          Mark Picked Up
        </button>
      );
    } else if (status === "picked_up") {
      actions.push(
        <button
          key="delivered"
          onClick={handleDelivered}
          disabled={actionLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
        >
          <CheckCircle className="h-4 w-4" />
          Mark Delivered
        </button>
      );
    }

    // Cancel button always available unless already terminal status
    if (!["delivered", "cancelled", "failed"].includes(status)) {
      actions.push(
        <button
          key="cancel"
          onClick={() => setShowCancelForm(!showCancelForm)}
          disabled={actionLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
        >
          <XCircle className="h-4 w-4" />
          Cancel
        </button>
      );
    }

    // Fail button for non-terminal statuses
    if (!["delivered", "cancelled", "failed"].includes(status)) {
      actions.push(
        <button
          key="fail"
          onClick={() => setShowFailForm(!showFailForm)}
          disabled={actionLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition"
        >
          <XCircle className="h-4 w-4" />
          Mark Failed
        </button>
      );
    }

    return actions;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/residential/requests" className="text-sky-600 hover:text-sky-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dispatch Request</h1>
          <p className="text-sm text-slate-500">Ref: {request.referenceCode}</p>
        </div>
      </div>

      {/* Status Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Current Status</h2>
            <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[request.status]}`}>
              {request.status.charAt(0).toUpperCase() +
                request.status.slice(1).replace("_", " ")}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">{getActionButtons()}</div>
        </div>

        {/* Cancel Form */}
        {showCancelForm && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <label className="block text-sm font-medium text-slate-900 mb-2">Cancellation Reason</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Explain why this request is being cancelled..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 text-sm mb-3"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition text-sm font-medium"
              >
                Confirm Cancellation
              </button>
              <button
                onClick={() => {
                  setShowCancelForm(false);
                  setCancelReason("");
                }}
                className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Failure Form */}
        {showFailForm && (
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <label className="block text-sm font-medium text-slate-900 mb-2">Failure Reason</label>
            <textarea
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              placeholder="Explain why this request failed..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 text-sm mb-3"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleFail}
                disabled={actionLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition text-sm font-medium"
              >
                Confirm Failure
              </button>
              <button
                onClick={() => {
                  setShowFailForm(false);
                  setFailureReason("");
                }}
                className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Request Details */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Request Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reference Code</label>
            <p className="font-mono text-slate-900">{request.referenceCode}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Parcel Category</label>
            <p className="text-slate-900">{request.parcelCategory}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Urgency</label>
            <p className="text-slate-900">{request.urgency}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
            <p className="text-slate-900">{request.paymentMethod}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Status</label>
            <p className="text-slate-900 font-medium">{request.paymentStatus}</p>
          </div>
        </div>
      </div>

      {/* Route Information */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Route Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              Pickup Location
            </label>
            <p className="text-slate-900">{request.pickupAddress}</p>
            <p className="text-sm text-slate-600">
              {request.pickupArea}, {request.pickupParish}
            </p>
          </div>
          <div className="border-l-2 border-slate-300 pl-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                Dropoff Location
              </label>
              <p className="text-slate-900">{request.dropoffAddress}</p>
              <p className="text-sm text-slate-600">
                {request.dropoffArea}, {request.dropoffParish}
              </p>
            </div>
          </div>
        </div>
        {request.parcelNotes && (
          <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200">
            <p className="text-sm font-medium text-slate-700">Parcel Notes</p>
            <p className="text-sm text-slate-600 mt-1">{request.parcelNotes}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Timeline</h2>
        <div className="space-y-3">
          {[
            { label: "Submitted", value: request.submittedAt },
            { label: "Confirmed", value: request.confirmedAt },
            { label: "Rider Assigned", value: request.riderAssignedAt },
            { label: "Picked Up", value: request.pickedUpAt },
            { label: "Delivered", value: request.deliveredAt },
            { label: "Cancelled", value: request.cancelledAt },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{item.label}</span>
              <span className="font-mono text-slate-900">
                {item.value ? new Date(item.value).toLocaleString() : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Events Log */}
      {request.events && request.events.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Event Log</h2>
          <div className="space-y-3">
            {request.events.map((event: any, index: number) => (
              <div key={index} className="flex gap-3 p-3 bg-slate-50 rounded">
                <Clock className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{event.type}</p>
                  {event.metadata && (
                    <p className="text-xs text-slate-600 mt-1">{JSON.stringify(event.metadata)}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">{new Date(event.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
