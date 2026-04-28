import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { legalDocumentsRegistry } from "@/content/legal";
import { notificationTemplatesRegistry } from "@/content/notifications";
import type {
  CoverageZone,
  DeliveryLeg,
  DeliveryTransferPlan,
  EmployeeAnnouncement,
  EmployeeGuide,
  EmployeePayrollRecord,
  EmployeeProfile,
  EmployeePayoutRecord,
  LegalDocument,
  MerchantAddress,
  MerchantDelivery,
  MerchantDispatchEvent,
  MerchantNotificationPreference,
  MerchantOrder,
  MerchantTeamMember,
  NotificationTemplate,
  OnboardingStore,
  PartnerCarrier,
  PartnerHandoffLocation,
  PartnerTrackingEvent,
  StoredUser,
  SupportContextSnapshot,
  SupportConversation,
  SupportEvent,
  SupportHandoff,
  SupportKnowledgeArticle,
  SupportMessage,
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

function toTitleFromEventType(eventType: string | undefined) {
  if (!eventType) return "Referral event";
  return eventType
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

function seedSupportKnowledgeArticles(timestamp: string): SupportKnowledgeArticle[] {
  return [
    {
      id: "8bba0e71-841e-4da8-9d17-60b31fbbe001",
      domain: "public",
      audience: ["slyder_applicant", "slyder"],
      title: "How do I apply to become a Slyder?",
      slug: "how-to-apply-to-become-a-slyder",
      summary: "Step-by-step guide to submitting a Slyder application on SLYDE.",
      content: [
        "To apply as a Slyder, visit slydenetwork.com/become-a-slyder and complete the online application form.",
        "You will need to provide your personal details, preferred delivery zone, vehicle type, and upload the required documents (national ID, driver's licence, vehicle registration, insurance, and fitness certificate).",
        "Once submitted you will receive a confirmation email and WhatsApp message with your application code.",
        "SLYDE reviews applications region by region as zones launch. You will be contacted when your application moves forward.",
        "If you have questions about your application status, contact support at info@slyde.app or call 876-594-7320.",
      ].join("\n\n"),
      tags: ["application", "onboarding", "slyder"],
      published: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "8bba0e71-841e-4da8-9d17-60b31fbbe002",
      domain: "public",
      audience: ["slyder"],
      title: "What documents do I need to complete onboarding?",
      slug: "documents-required-for-slyder-onboarding",
      summary: "A full list of the documents you must upload before you can go live as a Slyder.",
      content: [
        "Before you can be activated as a Slyder you must upload clear, valid copies of the following documents:",
        "- **National ID** – a current government-issued photo ID (passport, national ID card, or driver's licence).",
        "- **Driver's Licence** – must be valid and cover the vehicle class you are operating.",
        "- **Vehicle Registration** – the current registration certificate for the vehicle you will use for deliveries.",
        "- **Insurance** – comprehensive or commercial vehicle insurance that is currently in force.",
        "- **Fitness Certificate** – a current fitness certificate issued by the relevant authority.",
        "- **Profile Photo** – a clear, recent headshot for your Slyder profile.",
        "Upload all documents through the onboarding portal at /slyder/onboarding. Each document will be reviewed by the SLYDE team. You will be notified of approval or if a re-upload is needed.",
        "Documents that are expired, blurry, or missing information will be rejected and you will need to re-upload them.",
      ].join("\n\n"),
      tags: ["documents", "onboarding", "verification"],
      published: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "8bba0e71-841e-4da8-9d17-60b31fbbe003",
      domain: "public",
      audience: ["slyder"],
      title: "How does Slyder activation work?",
      slug: "how-slyder-activation-works",
      summary: "Understanding the steps from application approval to going live on the SLYDE network.",
      content: [
        "Activation as a Slyder happens in stages after your application is approved:",
        "1. **Approval** – The SLYDE team approves your application and sends you an activation email.",
        "2. **Account setup** – Follow the link in your activation email to set a password and create your Slyder account.",
        "3. **Document upload** – Log in to /slyder/onboarding and upload all required documents.",
        "4. **Document review** – The SLYDE team reviews your documents, typically within 1–3 business days.",
        "5. **Readiness check** – Complete any remaining onboarding steps such as confirming your zone and vehicle details.",
        "6. **Go live** – Once all steps are passed and your zone is ready, your account is set to eligible and you can begin receiving deliveries.",
        "You can check your current onboarding status at any time by logging in to your Slyder portal.",
      ].join("\n\n"),
      tags: ["activation", "onboarding", "account"],
      published: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "8bba0e71-841e-4da8-9d17-60b31fbbe004",
      domain: "public",
      audience: ["slyder_applicant", "slyder"],
      title: "Which areas does SLYDE currently cover?",
      slug: "slyde-coverage-areas",
      summary: "Find out which parishes and zones SLYDE operates in and what is coming next.",
      content: [
        "SLYDE is launching region by region across Jamaica. The network currently covers or is preparing to launch in the following areas:",
        "- **Kingston** – Live for local reward testing.",
        "- **St. Andrew** – Active zone, open for Slyder applications.",
        "- **St. Catherine** – Active zone, open for Slyder applications.",
        "- **Portmore** – Active zone, open for Slyder applications.",
        "- **Montego Bay** – Active zone, open for Slyder applications.",
        "- **Ocho Rios** – Active zone, open for Slyder applications.",
        "- **Mandeville** – Active zone, open for Slyder applications.",
        "- **Santa Cruz** – Active zone, open for Slyder applications.",
        "- **Falmouth** – Active zone, open for Slyder applications.",
        "- **Runaway Bay** – Active zone, open for Slyder applications.",
        "- **Negril** – Active zone, open for Slyder applications.",
        "- **Savanna-la-Mar** – Active zone, open for Slyder applications.",
        "- **Junction** – Active zone, open for Slyder applications.",
        "- **May Pen** – Active zone, open for Slyder applications.",
        "Additional parishes are being added as the network grows. If your area is not listed, you are welcome to submit an application and SLYDE will notify you when your area opens.",
        "For the latest coverage information visit slydenetwork.com/coverage or contact support.",
      ].join("\n\n"),
      tags: ["coverage", "zones", "parishes", "jamaica"],
      published: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "8bba0e71-841e-4da8-9d17-60b31fbbe005",
      domain: "public",
      audience: ["merchant"],
      title: "How do I partner my business with SLYDE?",
      slug: "how-to-partner-business-with-slyde",
      summary: "Learn how to register your business as a SLYDE merchant partner.",
      content: [
        "Businesses can partner with SLYDE to access same-day and on-demand delivery across Jamaica.",
        "To get started:",
        "1. Visit slydenetwork.com/for-businesses and submit a merchant interest form.",
        "2. A member of the SLYDE team will contact you to discuss your delivery needs and volume.",
        "3. Once approved, you will receive access to the merchant portal to manage orders, track deliveries, and view reporting.",
        "SLYDE works with businesses of all sizes — from local restaurants and retailers to larger commercial operations.",
        "For enquiries contact info@slyde.app or call 876-594-7320.",
      ].join("\n\n"),
      tags: ["merchant", "business", "partner"],
      published: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "8bba0e71-841e-4da8-9d17-60b31fbbe006",
      domain: "public",
      audience: ["slyder_applicant", "slyder", "merchant", "public"],
      title: "How do I contact SLYDE support?",
      slug: "how-to-contact-slyde-support",
      summary: "The different ways to reach the SLYDE support team for help.",
      content: [
        "You can reach SLYDE support through any of the following channels:",
        "- **Support form** – Submit a request at slydenetwork.com/support. You will receive a reference number to track your case.",
        "- **Email** – info@slyde.app for general enquiries and support.",
        "- **Phone** – 876-594-7320 during business hours (Monday to Friday, 8 am – 6 pm).",
        "- **WhatsApp** – Message the same number for quick queries.",
        "When contacting support, please have your application code, account email, or support ticket number ready so the team can assist you faster.",
      ].join("\n\n"),
      tags: ["contact", "support", "help"],
      published: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "8bba0e71-841e-4da8-9d17-60b31fbbe007",
      domain: "public",
      audience: ["slyder"],
      title: "How does the referral programme work?",
      slug: "how-the-slyder-referral-programme-works",
      summary: "Earn rewards by referring drivers who successfully join the SLYDE network.",
      content: [
        "SLYDE has a referral programme that rewards existing Slyders for bringing qualified drivers onto the network.",
        "**How to refer someone:**",
        "1. Log in to your Slyder portal and go to the Refer a Slyder section.",
        "2. Share your unique referral link or code with the driver you want to refer.",
        "3. When the referred driver applies using your link and completes the onboarding process, you earn a referral reward.",
        "**Reward conditions:**",
        "- The referred driver must complete the full onboarding process and become active.",
        "- Rewards are credited to your account once the referred driver's first delivery is completed.",
        "- Self-referrals are not permitted.",
        "For full programme terms visit slydenetwork.com/refer or contact support.",
      ].join("\n\n"),
      tags: ["referral", "rewards", "programme"],
      published: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "8bba0e71-841e-4da8-9d17-60b31fbbe008",
      domain: "public",
      audience: ["slyder"],
      title: "What should I do if my document is rejected?",
      slug: "what-to-do-if-document-rejected",
      summary: "Steps to take when a document you uploaded is rejected during the review process.",
      content: [
        "If a document you uploaded is rejected during the SLYDE onboarding review, you will receive a notification explaining the reason.",
        "Common rejection reasons include:",
        "- The image is blurry or too dark to read clearly.",
        "- The document is expired.",
        "- The document type does not match what was requested.",
        "- Key details (name, dates, registration number) are cut off or obscured.",
        "**To re-upload a rejected document:**",
        "1. Log in to your Slyder portal at slydenetwork.com/slyder/onboarding.",
        "2. Navigate to the Documents section.",
        "3. Find the rejected document and select Re-upload.",
        "4. Upload a new, clear photo or scan of the valid document.",
        "The SLYDE team will re-review your submission, typically within 1–3 business days.",
        "If you believe a rejection was made in error, contact support at info@slyde.app with your application code and details.",
      ].join("\n\n"),
      tags: ["documents", "rejection", "re-upload", "verification"],
      published: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function seedCoverageZones(timestamp: string): CoverageZone[] {
  return [
    {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Kingston",
      parish: "Kingston",
      requiredReadySlyders: 50,
      merchantAvailability: "open",
      estimatedLaunchLabel: "Live for local reward testing",
      isLive: true,
      isPaused: false,
      notes: "Seeded as a live zone so local referral reward claim and gift flows can be tested end-to-end.",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function seedPartnerCarriers(timestamp: string): PartnerCarrier[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Knutsford Express",
      slug: "knutsford-express",
      type: "branch_network",
      supportsTracking: true,
      supportsApi: false,
      supportsFinalDelivery: false,
      supportsBranchCollection: true,
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: crypto.randomUUID(),
      name: "Tara",
      slug: "tara",
      type: "branch_network",
      supportsTracking: false,
      supportsApi: false,
      supportsFinalDelivery: false,
      supportsBranchCollection: true,
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: crypto.randomUUID(),
      name: "DHL",
      slug: "dhl",
      type: "courier",
      supportsTracking: true,
      supportsApi: false,
      supportsFinalDelivery: true,
      supportsBranchCollection: false,
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function seedPartnerHandoffLocations(timestamp: string, carriers: PartnerCarrier[]): PartnerHandoffLocation[] {
  const knutsford = carriers.find((item) => item.slug === "knutsford-express");
  const tara = carriers.find((item) => item.slug === "tara");
  const dhl = carriers.find((item) => item.slug === "dhl");
  return [
    ...(knutsford
      ? [
          {
            id: crypto.randomUUID(),
            partnerCarrierId: knutsford.id,
            name: "Knutsford Kingston Hub",
            parish: "Kingston",
            town: "Kingston",
            addressLine: "Half-Way Tree Transport Centre",
            active: true,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ]
      : []),
    ...(tara
      ? [
          {
            id: crypto.randomUUID(),
            partnerCarrierId: tara.id,
            name: "Tara Kingston Office",
            parish: "Kingston",
            town: "Kingston",
            addressLine: "Downtown Kingston branch",
            active: true,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ]
      : []),
    ...(dhl
      ? [
          {
            id: crypto.randomUUID(),
            partnerCarrierId: dhl.id,
            name: "DHL Kingston Service Point",
            parish: "Kingston",
            town: "Kingston",
            addressLine: "New Kingston service counter",
            active: true,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ]
      : []),
  ];
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

export async function createSeedStore(): Promise<OnboardingStore> {
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
  const partnerCarriers = seedPartnerCarriers(timestamp);

  return {
    users: [adminUser, ...employeeUsers],
    applications: [],
    vehicles: [],
    documents: [],
    referrerAccounts: [],
    referrerLoginChallenges: [],
    referrerSessions: [],
    publicSlyderReferrals: [],
    referralEvents: [],
    referralRewards: [],
    referralRewardAudits: [],
    slyderProfiles: [],
    history: [],
    activationTokens: [],
    otpChallenges: [],
    sessions: [],
    notifications: [],
    notificationTemplates: seedNotificationTemplates(timestamp),
    notificationTriggers: [],
    supportConversations: [],
    supportMessages: [],
    supportContextSnapshots: [],
    supportHandoffs: [],
    supportEvents: [],
    supportKnowledgeArticles: seedSupportKnowledgeArticles(timestamp),
    coverageZones: seedCoverageZones(timestamp),
    merchantInterests: [],
    merchantLeads: [],
    merchantApplications: [],
    merchantIntegrationProfiles: [],
    merchantOnboardingEvents: [],
    merchantOrders: [],
    merchantDeliveries: [],
    merchantAddresses: [],
    merchantTeamMembers: [],
    merchantNotificationPreferences: [],
    merchantDispatchEvents: [],
    partnerCarriers,
    partnerHandoffLocations: seedPartnerHandoffLocations(timestamp, partnerCarriers),
    deliveryTransferPlans: [],
    deliveryLegs: [],
    partnerTrackingEvents: [],
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
  const raw = (await readFile(filePath, "utf8")).replace(/^\uFEFF/, "");
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
  const defaultCoverageZones = seedCoverageZones(new Date().toISOString());
  const defaultEmployeeUsers = await seedEmployeeUsers(new Date().toISOString());
  const normalizationTimestamp = new Date().toISOString();
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
  const baseCoverageZones = parsed.coverageZones ?? [];
  const mergedCoverageZones = [
    ...baseCoverageZones,
    ...defaultCoverageZones.filter(
      (seeded) => !baseCoverageZones.some((zone) => zone.id === seeded.id),
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
  const normalizedReferrerAccounts = (parsed.referrerAccounts ?? []).map((account) => {
    const legacyAccount = account as typeof account & { displayName?: string };
    return {
      id: account.id,
      fullName: account.fullName ?? legacyAccount.displayName ?? account.email ?? account.phone ?? "Referrer",
      email: account.email ?? undefined,
      phone: account.phone ?? undefined,
      emailVerifiedAt: account.emailVerifiedAt ?? undefined,
      phoneVerifiedAt: account.phoneVerifiedAt ?? undefined,
      isEnabled: account.isEnabled ?? true,
      createdAt: account.createdAt ?? normalizationTimestamp,
      updatedAt: account.updatedAt ?? account.createdAt ?? normalizationTimestamp,
    };
  });
  const normalizedReferrerLoginChallenges = (parsed.referrerLoginChallenges ?? []).map((challenge) => {
    const legacyChallenge = challenge as typeof challenge & {
      verifiedAt?: string;
      status?: string;
      updatedAt?: string;
    };
    return {
      id: challenge.id,
      referrerAccountId: challenge.referrerAccountId ?? undefined,
      channel: challenge.channel ?? (challenge.phone && !challenge.email ? "sms" : "email"),
      email: challenge.email ?? undefined,
      phone: challenge.phone ?? undefined,
      codeHash: challenge.codeHash,
      expiresAt: challenge.expiresAt,
      consumedAt:
        challenge.consumedAt ??
        legacyChallenge.verifiedAt ??
        (legacyChallenge.status && legacyChallenge.status !== "pending"
          ? legacyChallenge.updatedAt ?? challenge.createdAt
          : undefined),
      createdAt: challenge.createdAt ?? normalizationTimestamp,
    };
  });
  const normalizedReferrerSessions = (parsed.referrerSessions ?? [])
    .filter((session) => !(session as typeof session & { revokedAt?: string }).revokedAt)
    .map((session) => ({
      id: session.id,
      referrerAccountId: session.referrerAccountId,
      createdAt: session.createdAt ?? normalizationTimestamp,
      expiresAt: session.expiresAt,
    }));
  const normalizedReferralEvents = (parsed.referralEvents ?? []).map((event) => {
    const legacyEvent = event as typeof event & { notes?: string };
    return {
      id: event.id,
      referralId: event.referralId,
      eventType: event.eventType,
      title: event.title ?? toTitleFromEventType(event.eventType),
      description: event.description ?? legacyEvent.notes ?? undefined,
      metadata: event.metadata ?? undefined,
      createdAt: event.createdAt ?? normalizationTimestamp,
    };
  });
  const normalizedMerchantOrders: MerchantOrder[] = (parsed.merchantOrders ?? []).map((order) => ({
    ...order,
    requestedTiming: order.requestedTiming ?? "asap",
    status: order.status ?? "submitted",
  }));
  const normalizedMerchantApplications = (parsed.merchantApplications ?? []).map((application) => ({
    ...application,
    businessLicenseStatus: application.businessLicenseStatus ?? "missing",
    businessLicenseNumber: application.businessLicenseNumber ?? undefined,
    businessLicenseSubmittedAt: application.businessLicenseSubmittedAt ?? undefined,
    businessLicenseVerifiedAt: application.businessLicenseVerifiedAt ?? undefined,
    businessLicenseGraceEndsAt:
      application.businessLicenseGraceEndsAt ??
      (() => {
        const date = new Date(application.createdAt);
        date.setUTCDate(date.getUTCDate() + 30);
        return date.toISOString();
      })(),
    businessLicenseRequiredAfterDeliveries: application.businessLicenseRequiredAfterDeliveries ?? 10,
    businessLicenseDisabledAt: application.businessLicenseDisabledAt ?? undefined,
  }));
  const normalizedMerchantDeliveries: MerchantDelivery[] = (parsed.merchantDeliveries ?? []).map((delivery) => ({
    ...delivery,
    status: delivery.status ?? "submitted",
    dispatchMode: delivery.dispatchMode ?? "manual_dashboard",
    deliveryType: delivery.deliveryType ?? "in_parish",
  }));
  const normalizedMerchantAddresses: MerchantAddress[] = (parsed.merchantAddresses ?? []).map((address) => ({
    ...address,
    type: address.type ?? "pickup",
    isDefault: address.isDefault ?? false,
  }));
  const normalizedMerchantTeamMembers: MerchantTeamMember[] = (parsed.merchantTeamMembers ?? []).map((member) => ({
    ...member,
    status: member.status ?? "active",
    invitedAt: member.invitedAt ?? member.createdAt,
  }));
  const normalizedMerchantNotificationPreferences: MerchantNotificationPreference[] = (
    parsed.merchantNotificationPreferences ?? []
  ).map((preference) => ({
    ...preference,
    emailEnabled: preference.emailEnabled ?? true,
    smsEnabled: preference.smsEnabled ?? false,
    whatsappEnabled: preference.whatsappEnabled ?? true,
    notifyOnAssigned: preference.notifyOnAssigned ?? true,
    notifyOnDelivered: preference.notifyOnDelivered ?? true,
    notifyOnFailed: preference.notifyOnFailed ?? true,
    notifyOnBilling: preference.notifyOnBilling ?? true,
  }));
  const normalizedMerchantDispatchEvents: MerchantDispatchEvent[] = (
    parsed.merchantDispatchEvents ?? []
  ).map((event) => ({
    ...event,
    createdAt: event.createdAt ?? normalizationTimestamp,
  }));
  const normalizedPartnerCarriers: PartnerCarrier[] = (parsed.partnerCarriers ?? []).map((carrier) => ({
    ...carrier,
    supportsTracking: carrier.supportsTracking ?? false,
    supportsApi: carrier.supportsApi ?? false,
    supportsFinalDelivery: carrier.supportsFinalDelivery ?? false,
    supportsBranchCollection: carrier.supportsBranchCollection ?? false,
    active: carrier.active ?? true,
  }));
  const normalizedPartnerHandoffLocations: PartnerHandoffLocation[] = (parsed.partnerHandoffLocations ?? []).map((location) => ({
    ...location,
    active: location.active ?? true,
  }));
  const normalizedDeliveryTransferPlans: DeliveryTransferPlan[] = (parsed.deliveryTransferPlans ?? []).map((plan) => ({
    ...plan,
    deliveryType: plan.deliveryType ?? "out_of_parish",
    overallStatus: plan.overallStatus ?? "submitted",
  }));
  const normalizedDeliveryLegs: DeliveryLeg[] = (parsed.deliveryLegs ?? []).map((leg) => ({
    ...leg,
    status: leg.status ?? "pending",
  }));
  const normalizedPartnerTrackingEvents: PartnerTrackingEvent[] = (parsed.partnerTrackingEvents ?? []).map((event) => ({
    ...event,
    eventTimestamp: event.eventTimestamp ?? event.createdAt ?? normalizationTimestamp,
    createdAt: event.createdAt ?? normalizationTimestamp,
  }));
  const normalizedSupportConversations: SupportConversation[] = (parsed.supportConversations ?? []).map((conversation) => ({
    ...conversation,
    priority: conversation.priority ?? "normal",
    status: conversation.status ?? "open",
    updatedAt: conversation.updatedAt ?? conversation.createdAt ?? normalizationTimestamp,
  }));
  const normalizedSupportMessages: SupportMessage[] = (parsed.supportMessages ?? []).map((message) => ({
    ...message,
    messageFormat: message.messageFormat ?? "plain_text",
    aiGenerated: message.aiGenerated ?? false,
    createdAt: message.createdAt ?? normalizationTimestamp,
  }));
  const normalizedSupportContextSnapshots: SupportContextSnapshot[] = (parsed.supportContextSnapshots ?? []).map((snapshot) => ({
    ...snapshot,
    payload: snapshot.payload ?? {},
    createdAt: snapshot.createdAt ?? normalizationTimestamp,
  }));
  const normalizedSupportHandoffs: SupportHandoff[] = (parsed.supportHandoffs ?? []).map((handoff) => ({
    ...handoff,
    createdAt: handoff.createdAt ?? normalizationTimestamp,
  }));
  const normalizedSupportEvents: SupportEvent[] = (parsed.supportEvents ?? []).map((event) => ({
    ...event,
    createdAt: event.createdAt ?? normalizationTimestamp,
  }));
  const normalizedSupportKnowledgeArticles: SupportKnowledgeArticle[] = (parsed.supportKnowledgeArticles ?? []).map((article) => ({
    ...article,
    audience: article.audience ?? [],
    tags: article.tags ?? [],
    published: article.published ?? false,
    createdAt: article.createdAt ?? normalizationTimestamp,
    updatedAt: article.updatedAt ?? article.createdAt ?? normalizationTimestamp,
  }));

  return {
    users: mergedUsers,
    applications: parsed.applications ?? [],
    vehicles: parsed.vehicles ?? [],
    documents: parsed.documents ?? [],
    referrerAccounts: normalizedReferrerAccounts,
    referrerLoginChallenges: normalizedReferrerLoginChallenges,
    referrerSessions: normalizedReferrerSessions,
    publicSlyderReferrals: parsed.publicSlyderReferrals ?? [],
    referralEvents: normalizedReferralEvents,
    referralRewards: parsed.referralRewards ?? [],
    referralRewardAudits: parsed.referralRewardAudits ?? [],
    slyderProfiles: normalizedProfiles,
    history: parsed.history ?? [],
    activationTokens: normalizedActivationTokens,
    otpChallenges: parsed.otpChallenges ?? [],
    sessions: parsed.sessions ?? [],
    notifications: parsed.notifications ?? [],
    notificationTemplates: mergedNotificationTemplates,
    notificationTriggers: parsed.notificationTriggers ?? [],
    supportConversations: normalizedSupportConversations,
    supportMessages: normalizedSupportMessages,
    supportContextSnapshots: normalizedSupportContextSnapshots,
    supportHandoffs: normalizedSupportHandoffs,
    supportEvents: normalizedSupportEvents,
    supportKnowledgeArticles: normalizedSupportKnowledgeArticles,
    coverageZones: mergedCoverageZones,
    merchantInterests: parsed.merchantInterests ?? [],
    merchantLeads: parsed.merchantLeads ?? [],
    merchantApplications: normalizedMerchantApplications,
    merchantIntegrationProfiles: parsed.merchantIntegrationProfiles ?? [],
    merchantOnboardingEvents: parsed.merchantOnboardingEvents ?? [],
    merchantOrders: normalizedMerchantOrders,
    merchantDeliveries: normalizedMerchantDeliveries,
    merchantAddresses: normalizedMerchantAddresses,
    merchantTeamMembers: normalizedMerchantTeamMembers,
    merchantNotificationPreferences: normalizedMerchantNotificationPreferences,
    merchantDispatchEvents: normalizedMerchantDispatchEvents,
    partnerCarriers: normalizedPartnerCarriers,
    partnerHandoffLocations: normalizedPartnerHandoffLocations,
    deliveryTransferPlans: normalizedDeliveryTransferPlans,
    deliveryLegs: normalizedDeliveryLegs,
    partnerTrackingEvents: normalizedPartnerTrackingEvents,
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
