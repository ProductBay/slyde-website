import { prisma } from "@/server/db/prisma";
import type { ResidentIdType, ResidentKycStatus } from "@prisma/client";

export async function createResidentialKycProfile(data: {
  id: string;
  userId: string;
  trn: string;
  idType: ResidentIdType;
  idDocumentPath: string;
  kycStatus: ResidentKycStatus;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}) {
  return prisma.residentialAccountProfile.create({ data });
}

export async function getResidentialKycProfileByUserId(userId: string) {
  return prisma.residentialAccountProfile.findUnique({ where: { userId } });
}

export async function updateResidentialKycProfile(
  userId: string,
  data: {
    trn?: string;
    idType?: ResidentIdType;
    idDocumentPath?: string;
    kycStatus?: ResidentKycStatus;
    submittedAt?: Date;
    updatedAt: Date;
  },
) {
  return prisma.residentialAccountProfile.update({ where: { userId }, data });
}

export async function updateResidentialKycStatus(
  id: string,
  status: ResidentKycStatus,
  adminId: string,
  reviewNotes?: string,
) {
  return prisma.residentialAccountProfile.update({
    where: { id },
    data: {
      kycStatus: status,
      reviewedByAdminId: adminId,
      reviewedAt: new Date(),
      reviewNotes: reviewNotes ?? null,
      updatedAt: new Date(),
    },
  });
}

export async function listResidentialKycProfilesForAdmin(
  limit = 20,
  offset = 0,
  filters?: { status?: ResidentKycStatus },
) {
  const where = filters?.status ? { kycStatus: filters.status } : {};

  const [profiles, total] = await Promise.all([
    prisma.residentialAccountProfile.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    }),
    prisma.residentialAccountProfile.count({ where }),
  ]);

  return {
    profiles,
    total,
    page: Math.floor(offset / limit) + 1,
    pages: Math.ceil(total / limit),
  };
}

export async function getResidentialKycProfileById(id: string) {
  return prisma.residentialAccountProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });
}

export async function countKycByStatus() {
  const rows = await prisma.residentialAccountProfile.groupBy({
    by: ["kycStatus"],
    _count: { _all: true },
  });
  return Object.fromEntries(rows.map((r) => [r.kycStatus, r._count._all])) as Record<string, number>;
}
