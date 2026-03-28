import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { legalDocumentsRegistry } from "@/content/legal";
import { notificationTemplatesRegistry } from "@/content/notifications";
import type {
  EmployeeAnnouncement,
  EmployeeGuide,
  EmployeePayrollRecord,
  EmployeeProfile,
  EmployeePayoutRecord,
  LegalDocument,
  NotificationTemplate,
  OnboardingStore,
  StoredUser,
} from "@/types/backend/onboarding";
import { hashPassword } from "@/server/auth/passwords";
import { getDataDirectory } from "@/server/storage-paths";

const DATA_DIRECTORY = getDataDirectory();
const DATA_FILE = path.join(DATA_DIRECTORY, "slyde-onboarding-store.json");
const DATA_BACKUP_FILE = path.join(DATA_DIRECTORY, "slyde-onboarding-store.backup.json");

const defaultAdminPassword = process.env.SLYDE_DEFAULT_ADMIN_PASSWORD || "Admin123!";
const defaultEmployeePassword = process.env.SLYDE_DEFAULT_EMPLOYEE_PASSWORD || "Employee123!";

let writeLock: Promise<void> = Promise.resolve();

function nowIso() {
  return new Date().toISOString();
}

function seedLegalDocuments(timestamp: string): LegalDocument[] {
  return legalDocumentsRegistry.map((item) => ({
    id: crypto.randomUUID(),
    documentType: item.documentType,
    categoryKey: item.categoryKey,
    actorScopes: item.actorScopes,
    requiresAcceptance: item.requiresAcceptance,
    version: item.version,
    title: item.title,
    slug: item.slug,
    contentMarkdown: item.content.join("\n\n"),
    summary: item.summary,
    excerpt: item.excerpt,
    status: "published",
    isActive: true,
    effectiveFrom: timestamp,
    publishedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
}

function seedNotificationTemplates(timestamp: string): NotificationTemplate[] {
  return notificationTemplatesRegistry.map((item) => ({
    id: crypto.randomUUID(),
    key: item.key,
    name: item.name,
    actorType: item.actorType,
    eventType: item.eventType,
    channel: item.channel,
    subject: item.subject,
    bodyTemplate: item.bodyTemplate,
    plainTextTemplate: item.plainTextTemplate,
    isActive: item.isActive ?? true,
    version: item.version,
    locale: item.locale ?? "en-JM",
    description: item.description,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
}

async function seedEmployeeUsers(timestamp: string): Promise<StoredUser[]> {
  return [
    {
      id: crypto.randomUUID(),
      email: "manager@slyde.local",
      phone: "+18760000011",
      fullName: "Alicia Grant",
      passwordHash: await hashPassword(defaultEmployeePassword),
      roles: ["employee_staff", "employee_manager"],
      userType: "employee",
      accountStatus: "active",
      isEnabled: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: crypto.randomUUID(),
      email: "logistics@slyde.local",
      phone: "+18760000012",
      fullName: "Devon Blake",
      passwordHash: await hashPassword(defaultEmployeePassword),
      roles: ["employee_staff", "employee_logistics"],
      userType: "employee",
      accountStatus: "active",
      isEnabled: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function seedEmployeeProfiles(timestamp: string, users: StoredUser[]): EmployeeProfile[] {
  const manager = users.find((user) => user.email === "manager@slyde.local");
  const logistics = users.find((user) => user.email === "logistics@slyde.local");
  if (!manager || !logistics) return [];

  return [
    {
      id: crypto.randomUUID(),
      userId: manager.id,
      employeeCode: "SLYDE-MGR-001",
      displayName: "Alicia Grant",
      department: "leadership",
      title: "Operations Manager",
      employmentType: "full_time",
      startDate: "2026-01-15",
      locationLabel: "Kingston Operations Desk",
      payrollFrequency: "biweekly",
      payoutMethod: "bank_transfer",
      payoutAccountMasked: "NCB •••• 4412",
      isOnboarded: true,
      onboardingCompletedAt: timestamp,
      emergencyContactName: "Marsha Grant",
      emergencyContactPhone: "+18765550111",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: crypto.randomUUID(),
      userId: logistics.id,
      employeeCode: "SLYDE-LOG-014",
      displayName: "Devon Blake",
      department: "logistics",
      title: "Logistics Operations Associate",
      employmentType: "full_time",
      managerUserId: manager.id,
      startDate: "2026-02-03",
      locationLabel: "Kingston Dispatch Floor",
      payrollFrequency: "biweekly",
      payoutMethod: "bank_transfer",
      payoutAccountMasked: "JN •••• 8830",
      isOnboarded: false,
      emergencyContactName: "Andrea Blake",
      emergencyContactPhone: "+18765550112",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function seedEmployeeAnnouncements(timestamp: string, users: StoredUser[]): EmployeeAnnouncement[] {
  const manager = users.find((user) => user.email === "manager@slyde.local");

  return [
    {
      id: crypto.randomUUID(),
      title: "Morning dispatch desk protocol",
      excerpt: "Supervisors want all logistics employees on the dispatch floor fifteen minutes before handoff windows begin.",
      body:
        "Starting this week, logistics employees should check the dispatch board, confirm open zone readiness, and review exception notes before the first handoff period. Report unresolved merchant or rider blockers directly to your supervisor before the window opens.",
      audience: ["all_employees", "logistics", "supervisors"],
      publishedByUserId: manager?.id,
      priority: "important",
      publishedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: crypto.randomUUID(),
      title: "Payroll visibility rollout",
      excerpt: "Employees can now review paycheck totals and payout history directly inside the portal.",
      body:
        "The first release of the employee portal includes pay summary cards and payout history for approved staff accounts. Report any discrepancies to payroll before the scheduled pay date so corrections can be reviewed in the same cycle.",
      audience: ["all_employees"],
      publishedByUserId: manager?.id,
      priority: "normal",
      publishedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function seedEmployeeGuides(timestamp: string): EmployeeGuide[] {
  return [
    {
      id: crypto.randomUUID(),
      slug: "employee-handbook",
      title: "SLYDE employee handbook",
      summary: "Company-wide standards, operational expectations, and handbook guidance for active employees.",
      category: "handbook",
      audience: ["all_employees"],
      contentMarkdown: "See the employee handbook viewer for the current handbook source.",
      isFeatured: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: crypto.randomUUID(),
      slug: "logistics-floor-playbook",
      title: "Logistics floor playbook",
      summary: "Dispatch routines, escalation timing, and practical logistics desk expectations.",
      category: "operations",
      audience: ["logistics", "supervisors", "managers"],
      contentMarkdown:
        "1. Review launch, readiness, and exception queues before shift start.\n2. Confirm dispatch blockers with supervisors early.\n3. Log unresolved issues for the next handoff window.\n4. Escalate high-risk merchant failures immediately.",
      isFeatured: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function seedEmployeePayrollRecords(timestamp: string, profiles: EmployeeProfile[]): EmployeePayrollRecord[] {
  const logisticsProfile = profiles.find((profile) => profile.employeeCode === "SLYDE-LOG-014");
  if (!logisticsProfile) return [];

  return [
    {
      id: crypto.randomUUID(),
      employeeProfileId: logisticsProfile.id,
      payPeriodStart: "2026-03-01",
      payPeriodEnd: "2026-03-14",
      grossAmount: 84250,
      deductionsAmount: 9250,
      netAmount: 75000,
      status: "processed",
      payDate: "2026-03-18",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: crypto.randomUUID(),
      employeeProfileId: logisticsProfile.id,
      payPeriodStart: "2026-03-15",
      payPeriodEnd: "2026-03-28",
      grossAmount: 86800,
      deductionsAmount: 9800,
      netAmount: 77000,
      status: "scheduled",
      payDate: "2026-04-01",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function seedEmployeePayoutRecords(timestamp: string, profiles: EmployeeProfile[]): EmployeePayoutRecord[] {
  const logisticsProfile = profiles.find((profile) => profile.employeeCode === "SLYDE-LOG-014");
  if (!logisticsProfile) return [];

  return [
    {
      id: crypto.randomUUID(),
      employeeProfileId: logisticsProfile.id,
      sourceLabel: "Biweekly payroll",
      amount: 75000,
      status: "received",
      payoutDate: "2026-03-18",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: crypto.randomUUID(),
      employeeProfileId: logisticsProfile.id,
      sourceLabel: "Biweekly payroll",
      amount: 77000,
      status: "scheduled",
      payoutDate: "2026-04-01",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

async function createSeedStore(): Promise<OnboardingStore> {
  const timestamp = nowIso();
  const adminUser: StoredUser = {
    id: crypto.randomUUID(),
    email: "admin@slyde.local",
    phone: "+18760000000",
    fullName: "SLYDE Platform Admin",
    passwordHash: await hashPassword(defaultAdminPassword),
    roles: ["platform_admin", "operations_admin"],
    userType: "platform",
    accountStatus: "active",
    isEnabled: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const employeeUsers = await seedEmployeeUsers(timestamp);
  const employeeProfiles = seedEmployeeProfiles(timestamp, employeeUsers);

  return {
    users: [adminUser, ...employeeUsers],
    applications: [],
    vehicles: [],
    documents: [],
    slyderProfiles: [],
    history: [],
    activationTokens: [],
    otpChallenges: [],
    sessions: [],
    notifications: [],
    notificationTemplates: seedNotificationTemplates(timestamp),
    notificationTriggers: [],
    coverageZones: [],
    merchantInterests: [],
    legalDocuments: seedLegalDocuments(timestamp),
    legalAcceptances: [],
    legalPublishHistory: [],
    employeeApplications: [],
    employeeProfiles,
    employeeAnnouncements: seedEmployeeAnnouncements(timestamp, employeeUsers),
    employeeGuides: seedEmployeeGuides(timestamp),
    employeeGuideAcknowledgements: [],
    employeePayrollRecords: seedEmployeePayrollRecords(timestamp, employeeProfiles),
    employeePayoutRecords: seedEmployeePayoutRecords(timestamp, employeeProfiles),
  };
}

async function ensureStoreFile() {
  await mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    const seed = await createSeedStore();
    await writeFile(DATA_FILE, JSON.stringify(seed, null, 2), "utf8");
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function readStore(): Promise<OnboardingStore> {
  await ensureStoreFile();
  let parsed: Partial<OnboardingStore> | null = null;
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      parsed = await readJsonFile<Partial<OnboardingStore>>(DATA_FILE);
      break;
    } catch (error) {
      lastError = error;
      await sleep(50 * (attempt + 1));
    }
  }

  if (!parsed) {
    try {
      parsed = await readJsonFile<Partial<OnboardingStore>>(DATA_BACKUP_FILE);
    } catch {
      throw lastError instanceof Error ? lastError : new Error("Could not read onboarding store");
    }
  }

  const defaultLegalDocuments = seedLegalDocuments(new Date().toISOString());
  const defaultNotificationTemplates = seedNotificationTemplates(new Date().toISOString());
  const defaultEmployeeUsers = await seedEmployeeUsers(new Date().toISOString());
  const baseDocuments = parsed.legalDocuments ?? [];
  const baseTemplates = parsed.notificationTemplates ?? [];
  const mergedUsers = [
    ...(parsed.users ?? []),
    ...defaultEmployeeUsers.filter(
      (seeded) => !(parsed.users ?? []).some((user) => user.email.toLowerCase() === seeded.email.toLowerCase()),
    ),
  ];
  const defaultEmployeeProfiles = seedEmployeeProfiles(new Date().toISOString(), mergedUsers);
  const baseEmployeeProfiles = parsed.employeeProfiles ?? [];
  const mergedEmployeeProfiles = [
    ...baseEmployeeProfiles,
    ...defaultEmployeeProfiles.filter(
      (seeded) => !baseEmployeeProfiles.some((profile) => profile.userId === seeded.userId),
    ),
  ];
  const defaultEmployeeAnnouncements = seedEmployeeAnnouncements(new Date().toISOString(), mergedUsers);
  const baseEmployeeAnnouncements = parsed.employeeAnnouncements ?? [];
  const mergedEmployeeAnnouncements = [
    ...baseEmployeeAnnouncements,
    ...defaultEmployeeAnnouncements.filter(
      (seeded) => !baseEmployeeAnnouncements.some((announcement) => announcement.title === seeded.title),
    ),
  ];
  const defaultEmployeeGuides = seedEmployeeGuides(new Date().toISOString());
  const baseEmployeeGuides = parsed.employeeGuides ?? [];
  const mergedEmployeeGuides = [
    ...baseEmployeeGuides,
    ...defaultEmployeeGuides.filter((seeded) => !baseEmployeeGuides.some((guide) => guide.slug === seeded.slug)),
  ];
  const defaultEmployeePayroll = seedEmployeePayrollRecords(new Date().toISOString(), mergedEmployeeProfiles);
  const baseEmployeePayroll = parsed.employeePayrollRecords ?? [];
  const mergedEmployeePayroll = [
    ...baseEmployeePayroll,
    ...defaultEmployeePayroll.filter(
      (seeded) =>
        !baseEmployeePayroll.some(
          (record) =>
            record.employeeProfileId === seeded.employeeProfileId &&
            record.payPeriodStart === seeded.payPeriodStart &&
            record.payPeriodEnd === seeded.payPeriodEnd,
        ),
    ),
  ];
  const defaultEmployeePayouts = seedEmployeePayoutRecords(new Date().toISOString(), mergedEmployeeProfiles);
  const baseEmployeePayouts = parsed.employeePayoutRecords ?? [];
  const mergedEmployeePayouts = [
    ...baseEmployeePayouts,
    ...defaultEmployeePayouts.filter(
      (seeded) =>
        !baseEmployeePayouts.some(
          (record) =>
            record.employeeProfileId === seeded.employeeProfileId &&
            record.payoutDate === seeded.payoutDate &&
            record.amount === seeded.amount,
        ),
    ),
  ];
  const mergedLegalDocuments = [
    ...baseDocuments.map((document) => {
      const seeded = defaultLegalDocuments.find((item) => item.documentType === document.documentType);
      if (!seeded) return document;
      return {
        ...seeded,
        ...document,
        contentMarkdown: document.contentMarkdown || seeded.contentMarkdown,
        summary: document.summary || seeded.summary,
        excerpt: document.excerpt || seeded.excerpt,
        categoryKey: document.categoryKey || seeded.categoryKey,
        actorScopes: document.actorScopes || seeded.actorScopes,
        requiresAcceptance: document.requiresAcceptance ?? seeded.requiresAcceptance,
        status: document.status || seeded.status,
      };
    }),
    ...defaultLegalDocuments.filter(
      (seeded) => !baseDocuments.some((document) => document.documentType === seeded.documentType),
    ),
  ];
  const mergedNotificationTemplates = [
    ...baseTemplates.map((template) => {
      const seeded = defaultNotificationTemplates.find((item) => item.key === template.key);
      if (!seeded) return template;
      return {
        ...seeded,
        ...template,
        subject: template.subject ?? seeded.subject,
        bodyTemplate: template.bodyTemplate || seeded.bodyTemplate,
        plainTextTemplate: template.plainTextTemplate ?? seeded.plainTextTemplate,
        description: template.description ?? seeded.description,
        locale: template.locale ?? seeded.locale,
      };
    }),
    ...defaultNotificationTemplates.filter(
      (seeded) => !baseTemplates.some((template) => template.key === seeded.key),
    ),
  ];
  const normalizedProfiles = (parsed.slyderProfiles ?? []).map((profile) => ({
    ...profile,
    onboardingStatus: profile.onboardingStatus ?? "activation_pending",
    readinessStatus: profile.readinessStatus ?? "not_started",
    operationalStatus: profile.operationalStatus ?? "inactive",
    coverageZoneId: profile.coverageZoneId,
    contractAccepted: profile.contractAccepted ?? false,
    contractAcceptedAt: profile.contractAcceptedAt,
    vehicleVerified: profile.vehicleVerified ?? false,
    payoutSetupComplete: profile.payoutSetupComplete ?? false,
    profileComplete: profile.profileComplete ?? false,
    trainingComplete: profile.trainingComplete ?? false,
    permissionsComplete: profile.permissionsComplete ?? false,
    requiredAgreementsAccepted: profile.requiredAgreementsAccepted ?? false,
    setupCompletedAt: profile.setupCompletedAt,
    trainingAcknowledgedAt: profile.trainingAcknowledgedAt,
    activatedAt: profile.activatedAt,
    canGoOnline: profile.canGoOnline ?? false,
    canReceiveOrders: profile.canReceiveOrders ?? false,
    readinessChecklist: profile.readinessChecklist ?? {
      profileConfirmed: profile.profileComplete ?? false,
      vehicleConfirmed: profile.vehicleVerified ?? false,
      payoutConfigured: profile.payoutSetupComplete ?? false,
      legalAccepted: profile.contractAccepted ?? false,
      locationPermissionConfirmed: false,
      notificationPermissionConfirmed: false,
      equipmentConfirmed: false,
      trainingAcknowledged: profile.trainingComplete ?? false,
      emergencyContactConfirmed: false,
      overallStatus: "not_started",
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    },
  }));
  const normalizedActivationTokens = (parsed.activationTokens ?? []).map((token) => ({
    ...token,
    status:
      token.status ??
      (token.consumedAt
        ? "used"
        : new Date(token.expiresAt) <= new Date()
          ? "expired"
          : "issued"),
    issuedAt: token.issuedAt ?? token.createdAt,
    updatedAt: token.updatedAt ?? token.consumedAt ?? token.createdAt,
  }));

  return {
    users: mergedUsers,
    applications: parsed.applications ?? [],
    vehicles: parsed.vehicles ?? [],
    documents: parsed.documents ?? [],
    slyderProfiles: normalizedProfiles,
    history: parsed.history ?? [],
    activationTokens: normalizedActivationTokens,
    otpChallenges: parsed.otpChallenges ?? [],
    sessions: parsed.sessions ?? [],
    notifications: parsed.notifications ?? [],
    notificationTemplates: mergedNotificationTemplates,
    notificationTriggers: parsed.notificationTriggers ?? [],
    coverageZones: parsed.coverageZones ?? [],
    merchantInterests: parsed.merchantInterests ?? [],
    legalDocuments: mergedLegalDocuments,
    legalAcceptances: parsed.legalAcceptances ?? [],
    legalPublishHistory: parsed.legalPublishHistory ?? [],
    employeeApplications: parsed.employeeApplications ?? [],
    employeeProfiles: mergedEmployeeProfiles,
    employeeAnnouncements: mergedEmployeeAnnouncements,
    employeeGuides: mergedEmployeeGuides,
    employeeGuideAcknowledgements: parsed.employeeGuideAcknowledgements ?? [],
    employeePayrollRecords: mergedEmployeePayroll,
    employeePayoutRecords: mergedEmployeePayouts,
  };
}

export async function writeStore(store: OnboardingStore) {
  await ensureStoreFile();
  const payload = JSON.stringify(store, null, 2);
  const tempFile = `${DATA_FILE}.tmp`;
  await writeFile(tempFile, payload, "utf8");
  await rename(tempFile, DATA_FILE);
  await copyFile(DATA_FILE, DATA_BACKUP_FILE);
}

export async function withStoreTransaction<T>(mutator: (store: OnboardingStore) => Promise<T> | T): Promise<T> {
  const run = async () => {
    const store = await readStore();
    const result = await mutator(store);
    await writeStore(store);
    return result;
  };

  const resultPromise = writeLock.then(run, run);
  writeLock = resultPromise.then(() => undefined, () => undefined);
  return resultPromise;
}
