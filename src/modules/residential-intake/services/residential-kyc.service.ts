import { randomUUID } from "crypto";
import type { ResidentIdType } from "@prisma/client";
import {
  createResidentialKycProfile,
  getResidentialKycProfileByUserId,
  updateResidentialKycProfile,
} from "@/modules/residential-intake/repositories/residential-kyc.repository";

export async function submitResidentialKyc(
  userId: string,
  data: {
    trn: string;
    idType: ResidentIdType;
    idDocumentPath: string;
  },
): Promise<{ profileId: string; status: string }> {
  const now = new Date();
  const existing = await getResidentialKycProfileByUserId(userId);

  if (existing) {
    // Allow resubmission only if rejected or resubmission_required
    if (existing.kycStatus === "approved") {
      return { profileId: existing.id, status: "approved" };
    }
    await updateResidentialKycProfile(userId, {
      trn: data.trn,
      idType: data.idType,
      idDocumentPath: data.idDocumentPath,
      kycStatus: "pending_review",
      submittedAt: now,
      updatedAt: now,
    });
    return { profileId: existing.id, status: "pending_review" };
  }

  const profile = await createResidentialKycProfile({
    id: randomUUID(),
    userId,
    trn: data.trn,
    idType: data.idType,
    idDocumentPath: data.idDocumentPath,
    kycStatus: "pending_review",
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  return { profileId: profile.id, status: "pending_review" };
}

export async function getResidentialKycStatus(userId: string) {
  const profile = await getResidentialKycProfileByUserId(userId);
  if (!profile) return { status: "not_submitted" as const, profile: null };
  return { status: profile.kycStatus, profile };
}
