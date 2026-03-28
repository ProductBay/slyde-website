import type { EmployeeProfile, StoredUser } from "@/types/backend/onboarding";
import { findEmployeeProfileByUserId, upsertEmployeeProfile } from "@/modules/onboarding/repositories/onboarding.repository";
import { readPersistenceStore, withPersistenceTransaction } from "@/server/persistence";
import type { EmployeeApplicationInput } from "@/modules/employee/schemas/employee.schemas";

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
    const application = {
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
