"use server";

import { requireAdminContext } from "@/server/auth/admin-auth";
import { createAuditLog } from "@/server/audit/audit.service";
import type {
  ResidentialDispatchStatus,
  ResidentialIntakeStatus,
} from "@prisma/client";
import {
  getResidentialLeadDetails,
  updateResidentialLeadStatus,
  updateDispatchRequestStatus,
} from "./residential-admin.repository";

/**
 * Server action: Update residential lead status with audit logging
 */
export async function adminUpdateResidentialLeadStatus(
  leadId: string,
  status: ResidentialIntakeStatus,
  reason?: string
) {
  const adminId = await requireAdminContext();

  try {
    const lead = await getResidentialLeadDetails(leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    const previousStatus = lead.status;
    const updatedLead = await updateResidentialLeadStatus(leadId, status, reason);

    // Audit log
    await createAuditLog({
      adminId,
      action: "residential_lead_status_update",
      resourceType: "ResidentialLead",
      resourceId: leadId,
      previousValue: { status: previousStatus },
      newValue: { status },
      metadata: {
        reason,
        leadName: lead.fullName,
        phone: lead.phone,
      },
    });

    return {
      success: true,
      lead: updatedLead,
      message: `Lead status updated to ${status}`,
    };
  } catch (error: any) {
    console.error("Error updating lead status:", error);
    return {
      success: false,
      error: error.message || "Failed to update lead status",
    };
  }
}

/**
 * Server action: Update dispatch request status with audit logging
 */
export async function adminUpdateDispatchRequestStatus(
  requestId: string,
  status: ResidentialDispatchStatus,
  failureReason?: string
) {
  const adminId = await requireAdminContext();

  try {
    // Fetch current request for audit
    const { prisma } = await import("@/server/db/prisma");
    const currentRequest = await prisma.residentialDispatchRequest.findUnique({
      where: { id: requestId },
      include: { lead: true },
    });

    if (!currentRequest) {
      throw new Error("Dispatch request not found");
    }

    const previousStatus = currentRequest.status;
    const updatedRequest = await updateDispatchRequestStatus(requestId, status);

    // Audit log
    await createAuditLog({
      adminId,
      action: "residential_dispatch_status_update",
      resourceType: "ResidentialDispatchRequest",
      resourceId: requestId,
      previousValue: { status: previousStatus },
      newValue: { status },
      metadata: {
        failureReason,
        referenceCode: currentRequest.referenceCode,
        leadName: currentRequest.lead.fullName,
      },
    });

    return {
      success: true,
      request: updatedRequest,
      message: `Dispatch request status updated to ${status}`,
    };
  } catch (error: any) {
    console.error("Error updating dispatch request status:", error);
    return {
      success: false,
      error: error.message || "Failed to update dispatch request status",
    };
  }
}

/**
 * Server action: Approve residential lead for dispatch
 */
export async function adminApproveResidentialLead(leadId: string) {
  return adminUpdateResidentialLeadStatus(leadId, "approved", "Admin approved");
}

/**
 * Server action: Reject residential lead
 */
export async function adminRejectResidentialLead(leadId: string, reason: string) {
  return adminUpdateResidentialLeadStatus(leadId, "rejected", reason);
}

/**
 * Server action: Confirm dispatch request (move to confirmed status)
 */
export async function adminConfirmDispatchRequest(requestId: string) {
  return adminUpdateDispatchRequestStatus(requestId, "confirmed");
}

/**
 * Server action: Cancel dispatch request
 */
export async function adminCancelDispatchRequest(
  requestId: string,
  failureReason: string
) {
  return adminUpdateDispatchRequestStatus(requestId, "cancelled", failureReason);
}

/**
 * Server action: Mark request as picked up
 */
export async function adminMarkPickedUp(requestId: string) {
  return adminUpdateDispatchRequestStatus(requestId, "picked_up");
}

/**
 * Server action: Mark request as delivered
 */
export async function adminMarkDelivered(requestId: string) {
  return adminUpdateDispatchRequestStatus(requestId, "delivered");
}

/**
 * Server action: Mark request as failed
 */
export async function adminMarkFailed(requestId: string, reason: string) {
  return adminUpdateDispatchRequestStatus(requestId, "failed", reason);
}
