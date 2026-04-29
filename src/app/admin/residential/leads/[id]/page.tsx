"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getResidentialLeadDetails } from "@/modules/admin/residential-management/residential-admin.repository";
import {
  adminApproveResidentialLead,
  adminRejectResidentialLead,
} from "@/modules/admin/residential-management/residential-admin.actions";
import { SectionHeading } from "@/components/site/section-heading";
import type { ResidentialLead } from "@prisma/client";

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function ResidentialLeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const loadLead = useCallback(async () => {
    try {
      const result = await getResidentialLeadDetails(params.id);
      setLead(result);
    } catch (error) {
      console.error("Error loading lead:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  // Load on mount
  useState(() => {
    loadLead();
  });

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const result = await adminApproveResidentialLead(params.id);
      if (result.success) {
        setLead(result.lead);
        alert("Lead approved successfully");
      } else {
        alert(`Error: ${result.error}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setActionLoading(true);
    try {
      const result = await adminRejectResidentialLead(params.id, rejectionReason);
      if (result.success) {
        setLead(result.lead);
        setShowRejectForm(false);
        setRejectionReason("");
        alert("Lead rejected successfully");
      } else {
        alert(`Error: ${result.error}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading lead details...</div>;
  }

  if (!lead) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/residential/leads" className="text-sky-600 hover:text-sky-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Lead Not Found</h1>
        </div>
        <p className="text-slate-600">The requested lead could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/residential/leads" className="text-sky-600 hover:text-sky-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{lead.fullName}</h1>
          <p className="text-sm text-slate-500">Ref: {lead.referenceCode}</p>
        </div>
      </div>

      {/* Status Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Current Status</h2>
            <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[lead.status]}`}>
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </span>
          </div>
          {lead.status === "submitted" && (
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </button>
              <button
                onClick={() => setShowRejectForm(!showRejectForm)}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
            </div>
          )}
        </div>

        {/* Rejection Form */}
        {showRejectForm && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <label className="block text-sm font-medium text-slate-900 mb-2">Rejection Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this lead is being rejected..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 text-sm mb-3"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition text-sm font-medium"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason("");
                }}
                className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Details */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Lead Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <p className="text-slate-900">{lead.fullName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <p className="text-slate-900">{lead.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <p className="text-slate-900">{lead.email || "—"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Parish</label>
            <p className="text-slate-900">{lead.parish}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Area</label>
            <p className="text-slate-900">{lead.area}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reference Code</label>
            <p className="font-mono text-slate-900">{lead.referenceCode}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Created</label>
            <p className="text-slate-900">{new Date(lead.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Source</label>
            <p className="text-slate-900">{lead.sourceCampaign || "—"}</p>
          </div>
        </div>
      </div>

      {/* Dispatch Intent */}
      {lead.dispatchIntent && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Dispatch Intent</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Address</label>
              <p className="text-slate-900">{lead.dispatchIntent.pickupAddress}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dropoff Location</label>
              <p className="text-slate-900">
                {lead.dispatchIntent.dropoffAddress}, {lead.dispatchIntent.dropoffArea}, {lead.dispatchIntent.dropoffParish}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Parcel Category</label>
              <p className="text-slate-900">{lead.dispatchIntent.parcelCategory}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Urgency</label>
              <p className="text-slate-900">{lead.dispatchIntent.urgency}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
              <p className="text-slate-900">{lead.dispatchIntent.paymentPreference}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Fee</label>
              <p className="text-slate-900">
                {lead.dispatchIntent.estimatedFeeMin && lead.dispatchIntent.estimatedFeeMax
                  ? `JMD ${lead.dispatchIntent.estimatedFeeMin} - ${lead.dispatchIntent.estimatedFeeMax}`
                  : "—"}
              </p>
            </div>
          </div>
          {lead.dispatchIntent.parcelNotes && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <p className="text-slate-900">{lead.dispatchIntent.parcelNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* Dispatch Request */}
      {lead.dispatchRequest && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Active Dispatch Request</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Request ID</p>
              <p className="font-mono text-slate-900">{lead.dispatchRequest.id}</p>
            </div>
            <Link
              href={`/admin/residential/requests/${lead.dispatchRequest.id}`}
              className="text-sky-600 hover:text-sky-700 font-medium text-sm"
            >
              View Full Request →
            </Link>
          </div>
        </div>
      )}

      {/* Handoff Job Status */}
      {lead.handoffJob && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Handoff Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              <p className="text-slate-900 font-medium">{lead.handoffJob.state}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Attempts</label>
              <p className="text-slate-900">{lead.handoffJob.attempts}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Retry</label>
              <p className="text-slate-900">
                {lead.handoffJob.nextRetryAt ? new Date(lead.handoffJob.nextRetryAt).toLocaleString() : "—"}
              </p>
            </div>
          </div>
          {lead.handoffJob.lastError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              <p className="font-semibold mb-1">Last Error</p>
              <p className="font-mono text-xs">{lead.handoffJob.lastError}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
