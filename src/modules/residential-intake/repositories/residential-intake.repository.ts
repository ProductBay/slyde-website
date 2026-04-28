import { prisma } from "@/server/db/prisma";
import {
  type ResidentialDispatchStatus,
  type ResidentialHandoffState,
  type ResidentialIntakeStatus,
  type ResidentialParcelCategory,
  type ResidentialPaymentMethod,
  type ResidentialPaymentStatus,
  type ResidentialRequestEventType,
  type ResidentialWalletTxType,
} from "@prisma/client";

export async function createResidentialLead(data: {
  id: string;
  userId: string;
  referenceCode: string;
  fullName: string;
  phone: string;
  email?: string;
  parish: string;
  area: string;
  status: ResidentialIntakeStatus;
  sourceCampaign?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return prisma.residentialLead.create({ data });
}

export async function createResidentialDispatchIntent(data: {
  id: string;
  leadId: string;
  pickupAddress: string;
  dropoffParish: string;
  dropoffArea: string;
  dropoffAddress: string;
  parcelCategory: ResidentialParcelCategory;
  parcelNotes?: string;
  urgency: string;
  preferredWindow?: string;
  paymentPreference: ResidentialPaymentMethod;
  privacyAccepted: boolean;
  termsAccepted: boolean;
  consentVersion: string;
  consentedAt: Date;
  createdAt: Date;
}) {
  return prisma.residentialDispatchIntent.create({ data });
}

export async function createResidentialHandoffJob(data: {
  id: string;
  leadId: string;
  payloadJson: object;
  state: ResidentialHandoffState;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return prisma.residentialHandoffJob.create({ data });
}

export async function createResidentialDispatchRequest(data: {
  id: string;
  leadId: string;
  userId: string;
  referenceCode: string;
  status: ResidentialDispatchStatus;
  paymentMethod: ResidentialPaymentMethod;
  pickupAddress: string;
  pickupParish: string;
  pickupArea: string;
  dropoffAddress: string;
  dropoffParish: string;
  dropoffArea: string;
  parcelCategory: ResidentialParcelCategory;
  parcelNotes?: string;
  urgency: string;
  preferredWindow?: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}) {
  return prisma.residentialDispatchRequest.create({ data });
}

export async function ensureResidentialWallet(userId: string) {
  const now = new Date();
  return prisma.residentialWallet.upsert({
    where: { userId },
    create: {
      id: crypto.randomUUID(),
      userId,
      currency: "JMD",
      availableBalance: 0,
      heldBalance: 0,
      totalLifetimeTopUp: 0,
      createdAt: now,
      updatedAt: now,
    },
    update: {
      updatedAt: now,
    },
  });
}

export async function getResidentialWalletByUserId(userId: string) {
  return prisma.residentialWallet.findUnique({ where: { userId } });
}

export async function listResidentialDispatchRequestsForUser(userId: string) {
  return prisma.residentialDispatchRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 25,
  });
}

export async function findResidentialLeadByReference(referenceCode: string) {
  return prisma.residentialLead.findUnique({
    where: { referenceCode },
    include: { dispatchIntent: true, handoffJob: true },
  });
}

export async function updateResidentialLeadStatus(id: string, status: ResidentialIntakeStatus) {
  return prisma.residentialLead.update({
    where: { id },
    data: { status, updatedAt: new Date() },
  });
}

export async function updateHandoffJobState(
  id: string,
  state: ResidentialHandoffState,
  extra?: {
    attempts?: number;
    lastError?: string;
    nextRetryAt?: Date;
    acknowledgedAt?: Date;
  },
) {
  return prisma.residentialHandoffJob.update({
    where: { id },
    data: { state, updatedAt: new Date(), ...extra },
  });
}

export async function findPendingHandoffJobs() {
  return prisma.residentialHandoffJob.findMany({
    where: {
      state: { in: ["queued", "retrying"] },
      OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: new Date() } }],
    },
    include: { lead: { include: { dispatchIntent: true } } },
    orderBy: { createdAt: "asc" },
    take: 20,
  });
}

// ─── Wallet Transaction Ledger ────────────────────────────────────────────────

export async function createWalletTransaction(data: {
  id: string;
  walletId: string;
  userId: string;
  type: ResidentialWalletTxType;
  amountJMD: number;
  balanceAfterJMD: number;
  reference?: string;
  orderId?: string;
  description?: string;
  createdAt: Date;
}) {
  return prisma.residentialWalletTransaction.create({ data });
}

export async function listWalletTransactions(walletId: string, limit = 20) {
  return prisma.residentialWalletTransaction.findMany({
    where: { walletId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// ─── Payment State Transitions ───────────────────────────────────────────────

export async function updateDispatchRequestPaymentStatus(
  requestId: string,
  paymentStatus: ResidentialPaymentStatus,
  extra?: {
    paymentReference?: string;
    authorizedAt?: Date;
    capturedAt?: Date;
    refundedAt?: Date;
  },
) {
  return prisma.residentialDispatchRequest.update({
    where: { id: requestId },
    data: { paymentStatus, updatedAt: new Date(), ...extra },
  });
}

export async function updateDispatchRequestStatus(
  requestId: string,
  status: ResidentialDispatchStatus,
  extra?: {
    confirmedAt?: Date;
    riderAssignedAt?: Date;
    pickedUpAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
    failureReason?: string;
  },
) {
  return prisma.residentialDispatchRequest.update({
    where: { id: requestId },
    data: { status, updatedAt: new Date(), ...extra },
  });
}

// ─── Request Event Audit Log ─────────────────────────────────────────────────

export async function addRequestEvent(data: {
  id: string;
  requestId: string;
  eventType: ResidentialRequestEventType;
  title: string;
  description?: string;
  actorType: string;
  actorId?: string;
  metadata?: object;
  createdAt: Date;
}) {
  return prisma.residentialRequestEvent.create({ data });
}

export async function listRequestEvents(requestId: string) {
  return prisma.residentialRequestEvent.findMany({
    where: { requestId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getDispatchRequestDetail(
  referenceCode: string,
  userId: string,
) {
  return prisma.residentialDispatchRequest.findFirst({
    where: { referenceCode, userId },
    include: {
      events: { orderBy: { createdAt: "asc" } },
    },
  });
}
