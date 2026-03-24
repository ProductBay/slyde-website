import * as PrismaClient from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { normalizeEmail, normalizePhone } from "@/modules/onboarding/services/onboarding-rules.service";
import type {
  DocumentType,
  ReferralAttribution,
  SlyderApplication,
  SlyderApplicationDocument,
  SlyderApplicationVehicle,
} from "@/types/backend/onboarding";

function toPrismaDocumentType(type: DocumentType) {
  return type;
}

export async function findRecentPublicApplicationInPrisma(email: string, phone: string) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);

  return prisma.slyderApplication.findFirst({
    where: {
      email: normalizedEmail,
      phone: normalizedPhone,
      applicationStatus: {
        not: "rejected",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createPublicApplicationInPrisma(
  application: SlyderApplication,
  vehicle: SlyderApplicationVehicle | undefined,
  documents: SlyderApplicationDocument[],
) {
  return prisma.$transaction(async (tx) => {
    await tx.slyderApplication.create({
      data: {
        id: application.id,
        applicationCode: application.applicationCode,
        fullName: application.fullName,
        email: normalizeEmail(application.email),
        phone: normalizePhone(application.phone),
        dateOfBirth: new Date(application.dateOfBirth),
        parish: application.parish,
        address: application.address,
        trn: application.trn,
        emergencyContactName: application.emergencyContactName,
        emergencyContactPhone: application.emergencyContactPhone,
        courierType: application.courierType,
        workTypePreference: application.workTypePreference,
        availability: application.availability,
        preferredZones: application.preferredZones,
        deliveryTypePreferences: application.deliveryTypePreferences,
        maxTravelComfort: application.maxTravelComfort,
        peakHours: application.peakHours,
        smartphoneType: application.smartphoneType,
        whatsappNumber: application.whatsappNumber,
        gpsConfirmed: application.gpsConfirmed,
        internetConfirmed: application.internetConfirmed,
        readinessAnswers: application.readinessAnswers as PrismaClient.Prisma.InputJsonValue,
        agreementsAccepted: application.agreementsAccepted as PrismaClient.Prisma.InputJsonValue,
        applicationStatus: application.applicationStatus,
        accountStatus: application.accountStatus,
        operationalStatus: application.operationalStatus,
        readinessStatus: application.readinessStatus,
        reviewNotes: application.reviewNotes,
        rejectionReason: application.rejectionReason,
        requestedDocumentNotes: application.requestedDocumentNotes,
        requestedDocumentTypes: application.requestedDocumentTypes ?? [],
        submittedAt: new Date(application.submittedAt),
        reviewedAt: application.reviewedAt ? new Date(application.reviewedAt) : null,
        reviewedBy: application.reviewedBy ?? null,
        linkedUserId: application.linkedUserId ?? null,
        linkedSlyderProfileId: application.linkedSlyderProfileId ?? null,
        createdAt: new Date(application.createdAt),
        updatedAt: new Date(application.updatedAt),
      },
    });

    if (vehicle) {
      await tx.slyderApplicationVehicle.create({
        data: {
          id: vehicle.id,
          applicationId: vehicle.applicationId,
          make: vehicle.make ?? null,
          model: vehicle.model ?? null,
          year: vehicle.year ?? null,
          color: vehicle.color ?? null,
          plateNumber: vehicle.plateNumber ?? null,
          registrationExpiry: vehicle.registrationExpiry ? new Date(vehicle.registrationExpiry) : null,
          insuranceExpiry: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry) : null,
          fitnessExpiry: vehicle.fitnessExpiry ? new Date(vehicle.fitnessExpiry) : null,
          createdAt: new Date(vehicle.createdAt),
          updatedAt: new Date(vehicle.updatedAt),
        },
      });
    }

    if (documents.length > 0) {
      await tx.slyderApplicationDocument.createMany({
        data: documents.map((document) => ({
          id: document.id,
          applicationId: document.applicationId,
          type: toPrismaDocumentType(document.type),
          fileUrl: document.fileUrl,
          storageKey: document.storageKey,
          fileName: document.fileName,
          mimeType: document.mimeType,
          verificationStatus: document.verificationStatus,
          rejectionReason: document.rejectionReason ?? null,
          uploadedAt: new Date(document.uploadedAt),
          reviewedAt: document.reviewedAt ? new Date(document.reviewedAt) : null,
          reviewedBy: document.reviewedBy ?? null,
        })),
      });
    }
  });
}

export async function updatePublicApplicationLinksInPrisma(
  applicationId: string,
  links: { linkedUserId?: string; linkedSlyderProfileId?: string },
) {
  return prisma.slyderApplication.update({
    where: { id: applicationId },
    data: {
      linkedUserId: links.linkedUserId ?? null,
      linkedSlyderProfileId: links.linkedSlyderProfileId ?? null,
      updatedAt: new Date(),
    },
  });
}

export async function updateApplicationDocumentInPrisma(
  documentId: string,
  input: {
    fileUrl: string;
    storageKey: string;
    fileName: string;
    mimeType: string;
    uploadedAt: string;
    verificationStatus: "pending" | "uploaded";
    rejectionReason?: string;
  },
) {
  return prisma.slyderApplicationDocument.update({
    where: { id: documentId },
    data: {
      fileUrl: input.fileUrl,
      storageKey: input.storageKey,
      fileName: input.fileName,
      mimeType: input.mimeType,
      uploadedAt: new Date(input.uploadedAt),
      verificationStatus: input.verificationStatus,
      rejectionReason: input.rejectionReason ?? null,
      reviewedAt: null,
      reviewedBy: null,
    },
  });
}

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : undefined;
}

function mapPrismaApplication(record: Awaited<ReturnType<typeof prisma.slyderApplication.findFirst>>) {
  if (!record) return null;

  const application: SlyderApplication = {
    id: record.id,
    applicationCode: record.applicationCode,
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    dateOfBirth: record.dateOfBirth.toISOString().slice(0, 10),
    parish: record.parish,
    address: record.address,
    trn: record.trn,
    emergencyContactName: record.emergencyContactName,
    emergencyContactPhone: record.emergencyContactPhone,
    courierType: record.courierType,
    workTypePreference: record.workTypePreference,
    availability: record.availability,
    preferredZones: record.preferredZones,
    deliveryTypePreferences: record.deliveryTypePreferences,
    maxTravelComfort: record.maxTravelComfort,
    peakHours: record.peakHours,
    smartphoneType: record.smartphoneType,
    whatsappNumber: record.whatsappNumber,
    gpsConfirmed: record.gpsConfirmed,
    internetConfirmed: record.internetConfirmed,
    readinessAnswers: record.readinessAnswers as Record<string, unknown>,
    agreementsAccepted: record.agreementsAccepted as Record<string, boolean>,
    referralAttribution: (record.readinessAnswers as { referralAttribution?: ReferralAttribution } | null)?.referralAttribution,
    applicationStatus: record.applicationStatus,
    accountStatus: record.accountStatus,
    operationalStatus: record.operationalStatus,
    readinessStatus: record.readinessStatus,
    reviewNotes: record.reviewNotes ?? undefined,
    rejectionReason: record.rejectionReason ?? undefined,
    requestedDocumentNotes: record.requestedDocumentNotes ?? undefined,
    requestedDocumentTypes: record.requestedDocumentTypes,
    submittedAt: record.submittedAt.toISOString(),
    reviewedAt: toIso(record.reviewedAt),
    reviewedBy: record.reviewedBy ?? undefined,
    linkedUserId: record.linkedUserId ?? undefined,
    linkedSlyderProfileId: record.linkedSlyderProfileId ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };

  return application;
}

export async function listPublicApplicationsFromPrisma() {
  const records = await prisma.slyderApplication.findMany({
    include: {
      vehicle: true,
      documents: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return records.map((record) => ({
    application: mapPrismaApplication(record)!,
    vehicle: record.vehicle
      ? ({
          id: record.vehicle.id,
          applicationId: record.vehicle.applicationId,
          make: record.vehicle.make ?? undefined,
          model: record.vehicle.model ?? undefined,
          year: record.vehicle.year ?? undefined,
          color: record.vehicle.color ?? undefined,
          plateNumber: record.vehicle.plateNumber ?? undefined,
          registrationExpiry: record.vehicle.registrationExpiry?.toISOString().slice(0, 10),
          insuranceExpiry: record.vehicle.insuranceExpiry?.toISOString().slice(0, 10),
          fitnessExpiry: record.vehicle.fitnessExpiry?.toISOString().slice(0, 10),
          createdAt: record.vehicle.createdAt.toISOString(),
          updatedAt: record.vehicle.updatedAt.toISOString(),
        } satisfies SlyderApplicationVehicle)
      : undefined,
    documents: record.documents.map((document) => ({
      id: document.id,
      applicationId: document.applicationId,
      type: document.type as DocumentType,
      fileUrl: document.fileUrl,
      storageKey: document.storageKey,
      fileName: document.fileName,
      mimeType: document.mimeType,
      verificationStatus: document.verificationStatus,
      rejectionReason: document.rejectionReason ?? undefined,
      uploadedAt: document.uploadedAt.toISOString(),
      reviewedAt: toIso(document.reviewedAt),
      reviewedBy: document.reviewedBy ?? undefined,
    }) satisfies SlyderApplicationDocument),
  }));
}