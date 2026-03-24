import { findEmployeeProfileByUserId } from "@/modules/onboarding/repositories/onboarding.repository";
import { readPersistenceStore, withPersistenceTransaction } from "@/server/persistence";
import type { EmployeeApplicationInput } from "@/modules/employee/schemas/employee.schemas";

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
  const profile = findEmployeeProfileByUserId(store, userId);
  if (!profile) {
    throw new Error("Employee profile not found");
  }

  const user = store.users.find((entry) => entry.id === userId);
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
