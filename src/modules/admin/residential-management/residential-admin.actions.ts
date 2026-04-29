"use server";

import { requireAdminContext } from "@/server/auth/guards";
import { NextResponse } from "next/server";
import type {
  ResidentialDispatchStatus,
  ResidentialIntakeStatus,
} from "@prisma/client";
import {
  updateResidentialLeadStatus,
  updateDispatchRequestStatus,
} from "./residential-admin.repository";

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

export async function adminMarkPickedUp(requestId: string) {
  return adminUpdateDispatchRequestStatus(requestId, "picked_up");
}

export async function adminMarkDelivered(requestId: string) {
  return adminUpdateDispatchRequestStatus(requestId, "delivered");
}

export async function adminMarkFailed(requestId: string, reason: string) {
  return adminUpdateDispatchRequestStatus(requestId, "failed", reason);
}
