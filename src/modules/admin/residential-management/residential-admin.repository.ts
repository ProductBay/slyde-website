import { prisma } from "@/server/db/prisma";
import type {
  ResidentialDispatchStatus,
  ResidentialIntakeStatus,
  ResidentialPaymentStatus,
} from "@prisma/client";

/**
 * Fetch paginated residential leads for admin dashboard
 */
export async function getResidentialLeadsForAdmin(
  limit: number = 20,
  offset: number = 0,
  filters?: {
    status?: ResidentialIntakeStatus;
    parish?: string;
    searchQuery?: string;
  }
) {
  const where: any = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.parish) {
    where.parish = filters.parish;
  }

  if (filters?.searchQuery) {
    where.OR = [
      { fullName: { contains: filters.searchQuery, mode: "insensitive" } },
      { phone: { contains: filters.searchQuery, mode: "insensitive" } },
      { email: { contains: filters.searchQuery, mode: "insensitive" } },
      { referenceCode: { contains: filters.searchQuery, mode: "insensitive" } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.residentialLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        dispatchIntent: true,
        dispatchRequest: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
        handoffJob: {
          select: {
            state: true,
            lastError: true,
            attempts: true,
          },
        },
      },
    }),
    prisma.residentialLead.count({ where }),
  ]);

  return {
    leads,
    total,
    page: Math.floor(offset / limit) + 1,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Get a single residential lead with full details
 */
export async function getResidentialLeadDetails(leadId: string) {
  return prisma.residentialLead.findUnique({
    where: { id: leadId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
        },
      },
      dispatchIntent: true,
      dispatchRequest: {
        include: {
          events: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
      handoffJob: true,
    },
  });
}

/**
 * Fetch paginated dispatch requests for admin dashboard
 */
export async function getResidentialDispatchRequestsForAdmin(
  limit: number = 20,
  offset: number = 0,
  filters?: {
    status?: ResidentialDispatchStatus;
    paymentStatus?: ResidentialPaymentStatus;
    parish?: string;
    searchQuery?: string;
  }
) {
  const where: any = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.paymentStatus) {
    where.paymentStatus = filters.paymentStatus;
  }

  if (filters?.parish) {
    where.pickupParish = filters.parish;
  }

  if (filters?.searchQuery) {
    where.OR = [
      { referenceCode: { contains: filters.searchQuery, mode: "insensitive" } },
      { pickupAddress: { contains: filters.searchQuery, mode: "insensitive" } },
      { dropoffAddress: { contains: filters.searchQuery, mode: "insensitive" } },
    ];
  }

  const [requests, total] = await Promise.all([
    prisma.residentialDispatchRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        lead: {
          select: {
            fullName: true,
            phone: true,
            referenceCode: true,
          },
        },
        events: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    }),
    prisma.residentialDispatchRequest.count({ where }),
  ]);

  return {
    requests,
    total,
    page: Math.floor(offset / limit) + 1,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Get single dispatch request details
 */
export async function getResidentialDispatchRequestDetails(requestId: string) {
  return prisma.residentialDispatchRequest.findUnique({
    where: { id: requestId },
    include: {
      user: true,
      lead: true,
      events: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/**
 * Update residential lead status
 */
export async function updateResidentialLeadStatus(
  leadId: string,
  status: ResidentialIntakeStatus,
  notes?: string
) {
  return prisma.residentialLead.update({
    where: { id: leadId },
    data: {
      status,
      updatedAt: new Date(),
    },
  });
}

/**
 * Update dispatch request status
 */
export async function updateDispatchRequestStatus(
  requestId: string,
  status: ResidentialDispatchStatus
) {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  // Auto-set timestamp fields based on status
  if (status === "confirmed") {
    updateData.confirmedAt = new Date();
  } else if (status === "cancelled") {
    updateData.cancelledAt = new Date();
  } else if (status === "picked_up") {
    updateData.pickedUpAt = new Date();
  } else if (status === "delivered") {
    updateData.deliveredAt = new Date();
  } else if (status === "failed") {
    updateData.failureReason = updateData.failureReason || "Admin cancelled";
  }

  return prisma.residentialDispatchRequest.update({
    where: { id: requestId },
    data: updateData,
  });
}

/**
 * Get statistics summary for admin dashboard
 */
export async function getResidentialStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalLeads,
    activeLeads,
    totalRequests,
    pendingRequests,
    confirmedRequests,
    completedRequests,
    failedRequests,
  ] = await Promise.all([
    prisma.residentialLead.count(),
    prisma.residentialLead.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.residentialDispatchRequest.count(),
    prisma.residentialDispatchRequest.count({ where: { status: "pending" } }),
    prisma.residentialDispatchRequest.count({ where: { status: "confirmed" } }),
    prisma.residentialDispatchRequest.count({ where: { status: "delivered" } }),
    prisma.residentialDispatchRequest.count({
      where: { status: { in: ["failed", "cancelled"] } },
    }),
  ]);

  return {
    totalLeads,
    activeLeads,
    totalRequests,
    pendingRequests,
    confirmedRequests,
    completedRequests,
    failedRequests,
    successRate:
      totalRequests > 0 ? ((completedRequests / totalRequests) * 100).toFixed(1) : 0,
  };
}
