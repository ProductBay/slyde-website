import type {
  AccountStatus,
  ApplicationStatus,
  CourierType,
  EmployeeApplicationStatus,
  EmployeeDepartmentCode,
  EmployeeEmploymentType,
  DocumentType,
  DocumentVerificationStatus,
  LaunchStatus,
  NotificationActorType,
  NotificationChannel,
  NotificationStatus,
  OnboardingStatus,
  OperationalStatus,
  ReferralAttribution,
  ReadinessStatus,
} from "@/types/backend/onboarding";

export type AdminNotificationChannel = NotificationChannel;

export type AdminNotificationView = {
  id: string;
  applicationId?: string;
  slyderProfileId?: string;
  applicantName: string;
  channel: AdminNotificationChannel;
  recipient: string;
  template: string;
  actorType?: NotificationActorType;
  relatedEntityType?: string;
  relatedEntityId?: string;
  providerName?: string;
  providerMessageId?: string;
  retryCount?: number;
  subjectSnapshot?: string;
  bodySnapshot?: string;
  variablesSnapshot?: Record<string, unknown>;
  status: NotificationStatus;
  failureReason?: string;
  createdAt: string;
  lastAttemptAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  resentFromId?: string;
};

export type AdminNotificationTemplateRow = {
  id: string;
  key: string;
  name: string;
  channel: NotificationChannel;
  actorType: NotificationActorType;
  eventType: string;
  version: string;
  isActive: boolean;
  updatedAt: string;
  usageCount: number;
  successCount: number;
  failureCount: number;
};

export type AdminNotificationHealth = {
  totals: {
    total: number;
    sent: number;
    failed: number;
    queued: number;
    recentRetries: number;
  };
  channelBreakdown: Array<{
    channel: NotificationChannel;
    total: number;
    success: number;
    failed: number;
    successRate: number;
  }>;
  failureReasons: Array<{
    reason: string;
    count: number;
  }>;
  recentFailures: AdminNotificationView[];
};

export type AdminApplicationRow = {
  id: string;
  applicationCode: string;
  fullName: string;
  phone: string;
  email: string;
  parish: string;
  town: string;
  zoneId: string;
  zoneName: string;
  courierType: CourierType;
  submittedAt: string;
  applicationStatus: ApplicationStatus;
  accountStatus: AccountStatus;
  readinessStatus: ReadinessStatus;
  operationalStatus: OperationalStatus;
  whatsappStatus: NotificationStatus | "not_sent";
  emailStatus: NotificationStatus | "not_sent";
  linkedProfileId?: string;
  linkedUserId?: string;
};

export type AdminSlyderRow = {
  id: string;
  applicationId: string;
  displayName: string;
  zoneId: string;
  zoneName: string;
  courierType: CourierType;
  accountStatus: AccountStatus;
  onboardingStatus: OnboardingStatus;
  readinessStatus: ReadinessStatus;
  operationalStatus: OperationalStatus;
  contractAccepted: boolean;
  permissionsComplete: boolean;
  approvedAt: string;
  canGoOnline: boolean;
  canReceiveOrders: boolean;
  userId: string;
};

export type ZoneMetrics = {
  applicants: number;
  approvedSlyders: number;
  readySlyders: number;
  requiredReadySlyders: number;
  readinessPercentage: number;
  remainingNeeded: number;
};

export type AdminZoneView = {
  id: string;
  name: string;
  parish: string;
  launchStatus: LaunchStatus;
  merchantAvailability: "closed" | "waitlist" | "open";
  estimatedLaunchLabel: string;
  isLive: boolean;
  isPaused: boolean;
  metrics: ZoneMetrics;
  publicMessage: {
    headline: string;
    body: string;
    recruitmentMessage: string;
    slyderBenefitMessage: string;
  };
};

export type AdminApplicationDetail = {
  application: AdminApplicationRow & {
    dateOfBirth: string;
    address: string;
    trn: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    workTypePreference: string;
    availability: string;
    preferredZones: string[];
    deliveryTypePreferences: string[];
    maxTravelComfort: string;
    peakHours: string;
    smartphoneType: string;
    whatsappNumber: string;
    gpsConfirmed: boolean;
    internetConfirmed: boolean;
    readinessAnswers: Record<string, unknown>;
    agreementsAccepted: Record<string, boolean>;
    reviewNotes?: string;
    rejectionReason?: string;
    requestedDocumentNotes?: string;
    requestedDocumentTypes?: DocumentType[];
    reviewedAt?: string;
    referralAttribution?: ReferralAttribution;
  };
  vehicle: {
    make?: string;
    model?: string;
    year?: string;
    color?: string;
    plateNumber?: string;
    registrationExpiry?: string;
    insuranceExpiry?: string;
    fitnessExpiry?: string;
  } | null;
  documents: Array<{
    id: string;
    type: DocumentType;
    fileName: string;
    fileUrl: string;
    previewAvailable?: boolean;
    uploadedAt: string;
    verificationStatus: DocumentVerificationStatus;
    rejectionReason?: string;
  }>;
  notificationHistory: AdminNotificationView[];
  auditTimeline: Array<{
    id: string;
    eventType: string;
    actorLabel?: string;
    createdAt: string;
    metadata?: Record<string, unknown>;
  }>;
  linkedUser: {
    id: string;
    fullName: string;
    accountStatus: AccountStatus;
    isEnabled: boolean;
  } | null;
  linkedSlyderProfile: {
    id: string;
    onboardingStatus: OnboardingStatus;
    readinessStatus: ReadinessStatus;
    operationalStatus: OperationalStatus;
    accountStatus: AccountStatus;
    canGoOnline: boolean;
  } | null;
  zone: AdminZoneView;
  readinessContribution: {
    currentPercentage: number;
    projectedPercentage: number;
    message: string;
  };
};

export type DashboardKpi = {
  label: string;
  value: number;
  subtext?: string;
  note?: string;
};

export type AdminDashboardData = {
  kpis: DashboardKpi[];
  topZones: AdminZoneView[];
  pendingApplications: AdminApplicationRow[];
  pendingEmployeeApplications: AdminEmployeeApplicationRow[];
  notificationSummary: {
    whatsappSent: number;
    emailSent: number;
    failed: number;
    recentFailures: AdminNotificationView[];
  };
  launchGroups: Record<LaunchStatus, AdminZoneView[]>;
};

export type AdminEmployeeApplicationRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  roleInterest: string;
  departmentInterest: EmployeeDepartmentCode;
  employmentType: EmployeeEmploymentType;
  location: string;
  submittedAt: string;
  status: EmployeeApplicationStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  linkedUserId?: string;
  linkedEmployeeProfileId?: string;
  inviteEmailStatus: NotificationStatus | "not_sent";
};

export type AdminEmployeeApplicationDetail = {
  application: AdminEmployeeApplicationRow & {
    experienceSummary: string;
    managerTrackInterest?: boolean;
    notes?: string;
  };
  linkedUser: {
    id: string;
    fullName: string;
    email: string;
    accountStatus: AccountStatus;
    isEnabled: boolean;
  } | null;
  linkedEmployeeProfile: {
    id: string;
    employeeCode: string;
    title: string;
    department: EmployeeDepartmentCode;
    isOnboarded: boolean;
    onboardingCompletedAt?: string;
  } | null;
  notificationHistory: AdminNotificationView[];
};
