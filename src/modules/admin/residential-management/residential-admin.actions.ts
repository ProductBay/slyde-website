"use server";

import { requireAdminContext } from "@/server/auth/guards";
import { NextResponse } from "next/server";
import type {
  ResidentialDispatchStatus,
  ResidentialIntakeStatus,
  ResidentKycStatus,
} from "@prisma/client";
import {
  updateResidentialLeadStatus,
  updateDispatchRequestStatus,
} from "./residential-admin.repository";
import { updateResidentialKycStatus } from "@/modules/residential-intake/repositories/residential-kyc.repository";

export async function adminUpdateResidentialLeadStatus(
  leadId: string,
  status: ResidentialIntakeStatus,
  reason?: string
) {
  const ctx = await requireAdminContext();
  if (ctx instanceof NextResponse) return { success: false, error: "Unauthorized" };

  try {
    const updated = await updateResidentialLeadStatus(leadId, status, reason);
    return { success: true, lead: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update lead status" };
  }
}

export async function adminUpdateDispatchRequestStatus(
  requestId: string,
  status: ResidentialDispatchStatus,
  failureReason?: string
) {
  const ctx = await requireAdminContext();
  if (ctx instanceof NextResponse) return { success: false, error: "Unauthorized" };

  try {
    const updated = await updateDispatchRequestStatus(requestId, status, failureReason);
    return { success: true, request: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update request status" };
  }
}

export async function adminApproveResidentialLead(leadId: string) {
  return adminUpdateResidentialLeadStatus(leadId, "approved");
}

export async function adminRejectResidentialLead(leadId: string, reason: string) {
  return adminUpdateResidentialLeadStatus(leadId, "rejected", reason);
}

export async function adminConfirmDispatchRequest(requestId: string) {
  return adminUpdateDispatchRequestStatus(requestId, "confirmed");
}

export async function adminCancelDispatchRequest(requestId: string, failureReason: string) {
  return adminUpdateDispatchRequestStatus(requestId, "cancelled", failureReason);
}

export async function adminUpdateResidentialKycStatus(
  profileId: string,
  status: ResidentKycStatus,
  reviewNotes?: string,
) {
  const ctx = await requireAdminContext();
  if (ctx instanceof NextResponse) return { success: false, error: "Unauthorized" };

  try {
    const updated = await updateResidentialKycStatus(profileId, status, ctx.user.id, reviewNotes);
    return { success: true, profile: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update resident verification status" };
  }
}

export async function adminApproveResidentialKyc(profileId: string, reviewNotes?: string) {
  return adminUpdateResidentialKycStatus(profileId, "approved", reviewNotes);
}

export async function adminRejectResidentialKyc(profileId: string, reviewNotes: string) {
  return adminUpdateResidentialKycStatus(profileId, "rejected", reviewNotes);
}

export async function adminRequestResidentialKycResubmission(profileId: string, reviewNotes: string) {
  return adminUpdateResidentialKycStatus(profileId, "resubmission_required", reviewNotes);
}

export async function adminMarkPickedUp(requestId: string) {
  return adminUpdateDispatchRequestStatus(requestId, "picked_up");
}

export async function adminMarkDelivered(requestId: string) {
  return adminUpdateDispatchRequestStatus(requestId, "delivered");
}

export async function adminMarkFailed(requestId: string, reason: string) {
  return adminUpdateDispatchRequestStatus(requestId, "failed", reason);
}
