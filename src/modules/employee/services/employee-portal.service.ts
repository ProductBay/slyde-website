import type { EmployeeProfile, EmployeeApplication, OnboardingStore, StoredUser, UserRoleCode } from "@/types/backend/onboarding";
import {
  findEmployeeProfileByUserId,
  findUserByEmailAndPhone,
  findUserById,
  upsertEmployeeProfile,
  upsertUser,
} from "@/modules/onboarding/repositories/onboarding.repository";
import { readPersistenceStore, withPersistenceTransaction } from "@/server/persistence";
import type { EmployeeApplicationInput } from "@/modules/employee/schemas/employee.schemas";
import { appendAuditEvent } from "@/server/audit/audit.service";
import { sendEmployeeActivationNotification, sendEmployeeApplicationSubmittedNotifications, sendEmployeeRejectedNotification } from "@/server/notifications/notification.service";
import { generateOpaqueToken, hashToken } from "@/server/auth/tokens";

function nowIso() {
  return new Date().toISOString();
}

function inferDepartment(user: StoredUser): EmployeeProfile["department"] {
  if (user.roles.includes("employee_logistics")) return "logistics";
  if (user.roles.includes("employee_hr")) return "hr";
  if (user.roles.includes("employee_payroll")) return "finance";
  if (user.roles.includes("employee_manager")) return "leadership";
  return "operations";
}

function inferTitle(user: StoredUser, department: EmployeeProfile["department"]) {
  if (user.roles.includes("employee_manager")) return "Team Manager";
  if (user.roles.includes("employee_supervisor")) return "Team Supervisor";
  if (department === "logistics") return "Logistics Operations Associate";
  if (department === "support") return "Support Associate";
  if (department === "finance") return "Finance Associate";
  if (department === "hr") return "People Operations Associate";
  if (department === "leadership") return "Operations Lead";
  return "Operations Associate";
}

export function buildDefaultEmployeeProfile(user: StoredUser): EmployeeProfile {
  const timestamp = nowIso();
  const department = inferDepartment(user);

  return {
    id: crypto.randomUUID(),
    userId: user.id,
    employeeCode: `SLYDE-EMP-${user.id.slice(0, 6).toUpperCase()}`,
    displayName: user.fullName,
    department,
    title: inferTitle(user, department),
    employmentType: "full_time",
    startDate: timestamp.slice(0, 10),
    locationLabel: "SLYDE Internal Team",
    payrollFrequency: "biweekly",
    payoutMethod: "bank_transfer",
    isOnboarded: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function roleAudienceFromProfile(title: string, department: string) {
  const audiences = ["all_employees"];
  if (department === "logistics") audiences.push("logistics");
  if (department === "operations") audiences.push("operations");
  if (department === "support") audiences.push("support");
  if (/supervisor/i.test(title)) audiences.push("supervisors");
  if (/manager/i.test(title)) audiences.push("managers");
  return audiences;
}

function employeeRolesFromApplication(application: EmployeeApplication): UserRoleCode[] {
  const roles = new Set<UserRoleCode>(["employee_staff"]);

  if (application.departmentInterest === "logistics") roles.add("employee_logistics");
  if (application.departmentInterest === "finance") roles.add("employee_payroll");
  if (application.departmentInterest === "hr") roles.add("employee_hr");
  if (application.departmentInterest === "leadership") roles.add("employee_manager");
  if (application.managerTrackInterest) roles.add("employee_supervisor");

  return Array.from(roles);
}

function buildEmployeeTitle(application: EmployeeApplication) {
  return application.roleInterest.trim() || "Operations Associate";
}

function buildEmployeeProfileFromApplication(user: StoredUser, application: EmployeeApplication, existing?: EmployeeProfile): EmployeeProfile {
  const timestamp = nowIso();
  const profile = existing ?? buildDefaultEmployeeProfile(user);

  return {
    ...profile,
    displayName: application.fullName,
    department: application.departmentInterest,
    title: buildEmployeeTitle(application),
    employmentType: application.employmentType,
    locationLabel: application.location,
    startDate: existing?.startDate ?? timestamp.slice(0, 10),
    isOnboarded: existing?.isOnboarded ?? false,
    updatedAt: timestamp,
  };
}

export async function getEmployeePortalData(userId: string) {
  const store = await readPersistenceStore();
  const user = store.users.find((entry) => entry.id === userId);
  if (!user) {
    throw new Error("Employee user not found");
  }

  const profile = findEmployeeProfileByUserId(store, userId) ?? buildDefaultEmployeeProfile(user);
  const manager = profile.managerUserId ? store.users.find((entry) => entry.id === profile.managerUserId) : undefined;
  const audiences = roleAudienceFromProfile(profile.title, profile.department);

  const announcements = store.employeeAnnouncements
    .filter((item) => item.audience.some((audience) => audiences.includes(audience)))
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));

  const guides = store.employeeGuides
    .filter((item) => item.audience.some((audience) => audiences.includes(audience)))
    .sort((left, right) => Number(right.isFeatured) - Number(left.isFeatured) || left.title.localeCompare(right.title));

  const payrollRecords = store.employeePayrollRecords
    .filter((item) => item.employeeProfileId === profile.id)
    .sort((left, right) => right.payDate.localeCompare(left.payDate));

  const payoutRecords = store.employeePayoutRecords
    .filter((item) => item.employeeProfileId === profile.id)
    .sort((left, right) => right.payoutDate.localeCompare(left.payoutDate));

  return {
    user,
    profile,
    manager,
    announcements,
    guides,
    payrollRecords,
    payoutRecords,
    latestPayroll: payrollRecords[0],
    upcomingPayroll: payrollRecords.find((item) => item.status !== "paid") ?? payrollRecords[0],
    latestPayout: payoutRecords[0],
  };
}

export async function submitEmployeeApplication(payload: EmployeeApplicationInput) {
  return withPersistenceTransaction(async (store) => {
    const timestamp = new Date().toISOString();
    const application: EmployeeApplication = {
      id: crypto.randomUUID(),
      fullName: payload.fullName,
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      roleInterest: payload.roleInterest,
      departmentInterest: payload.departmentInterest,
      employmentType: payload.employmentType,
      location: payload.location,
      experienceSummary: payload.experienceSummary,
      managerTrackInterest: payload.managerTrackInterest ?? false,
      status: "submitted" as const,
      submittedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    store.employeeApplications.push(application);
    await sendEmployeeApplicationSubmittedNotifications(store, application.id);
    return application;
  });
}

export async function listEmployeeApplications() {
  const store = await readPersistenceStore();
  return [...store.employeeApplications].sort((left, right) => right.submittedAt.localeCompare(left.submittedAt));
}

export async function getEmployeeApplicationById(applicationId: string) {
  const store = await readPersistenceStore();
  return store.employeeApplications.find((item) => item.id === applicationId) ?? null;
}

export async function inviteEmployeeApplicant(
  applicationId: string,
  actor: { id: string; fullName: string },
  reviewNotes?: string,
) {
  return withPersistenceTransaction(async (store) => {
    const application = store.employeeApplications.find((item) => item.id === applicationId);
    if (!application) {
      throw new Error("Employee application not found");
    }

    const timestamp = nowIso();
    const existingUser =
      (application.linkedUserId ? findUserById(store, application.linkedUserId) : undefined) ??
      findUserByEmailAndPhone(store, application.email, application.phone);

    if (existingUser && existingUser.userType !== "employee" && !existingUser.roles.some((role) => role.startsWith("employee_"))) {
      throw new Error("A non-employee account already exists with this email or phone number");
    }

    const user: StoredUser = existingUser
      ? {
          ...existingUser,
          fullName: application.fullName,
          email: application.email,
          phone: application.phone,
          roles: Array.from(new Set<UserRoleCode>([...existingUser.roles, ...employeeRolesFromApplication(application)])),
          userType: "employee",
          accountStatus: "activation_pending",
          isEnabled: true,
          activationIssuedAt: timestamp,
          updatedAt: timestamp,
        }
      : {
          id: crypto.randomUUID(),
          email: application.email,
          phone: application.phone,
          fullName: application.fullName,
          roles: employeeRolesFromApplication(application),
          userType: "employee",
          accountStatus: "activation_pending",
          isEnabled: true,
          activationIssuedAt: timestamp,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

    upsertUser(store, user);

    const existingProfile = findEmployeeProfileByUserId(store, user.id);
    const profile = buildEmployeeProfileFromApplication(user, application, existingProfile);
    upsertEmployeeProfile(store, profile);

    for (const token of store.activationTokens.filter((item) => item.userId === user.id && !item.consumedAt)) {
      token.status = "revoked";
      token.updatedAt = timestamp;
    }

    const plainToken = generateOpaqueToken(24);
    store.activationTokens.push({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: hashToken(plainToken),
      deliveryChannel: "email",
      status: "issued",
      issuedAt: timestamp,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    application.status = "approved";
    application.reviewedAt = timestamp;
    application.reviewedBy = actor.fullName;
    application.linkedUserId = user.id;
    application.linkedEmployeeProfileId = profile.id;
    application.notes = reviewNotes?.trim() || application.notes;
    application.updatedAt = timestamp;

    appendAuditEvent(store, {
      entityType: "user",
      entityId: user.id,
      eventType: "employee_activation_invited",
      actorUserId: actor.id,
      actorLabel: actor.fullName,
      metadata: {
        applicationId: application.id,
        employeeProfileId: profile.id,
      },
    });

    await sendEmployeeActivationNotification(store, user.id, application.id, plainToken);

    return {
      application,
      user,
      profile,
    };
  });
}

export async function rejectEmployeeApplicant(
  applicationId: string,
  reason: string,
  actor: { id: string; fullName: string },
) {
  return withPersistenceTransaction(async (store) => {
    const application = store.employeeApplications.find((item) => item.id === applicationId);
    if (!application) {
      throw new Error("Employee application not found");
    }

    const timestamp = nowIso();
    application.status = "rejected";
    application.reviewedAt = timestamp;
    application.reviewedBy = actor.fullName;
    application.notes = reason;
    application.updatedAt = timestamp;

    appendAuditEvent(store, {
      entityType: "user",
      entityId: application.linkedUserId ?? application.id,
      eventType: "employee_application_rejected",
      actorUserId: actor.id,
      actorLabel: actor.fullName,
      metadata: {
        applicationId: application.id,
        reason,
      },
    });

    await sendEmployeeRejectedNotification(store, application.id, reason);

    return application;
  });
}

export async function ensureEmployeeProfile(userId: string) {
  return withPersistenceTransaction(async (store) => {
    return ensureEmployeeProfileInStore(store, userId);
  });
}

export function ensureEmployeeProfileInStore(
  store: Awaited<ReturnType<typeof readPersistenceStore>>,
  userId: string,
) {
  const user = store.users.find((entry) => entry.id === userId);
  if (!user) {
    throw new Error("Employee user not found");
  }

  const existing = findEmployeeProfileByUserId(store, userId);
  if (existing) {
    return existing;
  }

  const profile = buildDefaultEmployeeProfile(user);
  upsertEmployeeProfile(store, profile);
  return profile;
}
