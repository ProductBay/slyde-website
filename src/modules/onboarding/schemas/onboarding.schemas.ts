import { z } from "zod";
import {
  accountStatuses,
  applicationStatuses,
  courierTypes,
  documentTypes,
  documentVerificationStatuses,
  operationalStatuses,
  readinessStatuses,
} from "@/types/backend/onboarding";

const nonEmpty = (message: string) => z.string().trim().min(1, message);
const relativeOrAbsoluteUrl = z.string().trim().refine(
  (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
  "Invalid url",
);

const documentInputSchema = z.object({
  name: nonEmpty("Document file name is required"),
  size: z.number().nonnegative().optional(),
  type: z.string().trim().default("application/octet-stream"),
  fileUrl: relativeOrAbsoluteUrl.optional(),
  fileDataUrl: z.string().trim().optional(),
  storageKey: z.string().trim().optional(),
}).superRefine((input, ctx) => {
  if (!input.fileUrl || !input.storageKey) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Document upload must complete before submission.",
    });
  }
});

const vehicleSchema = z.object({
  make: z.string().trim().optional(),
  model: z.string().trim().optional(),
  year: z.string().trim().optional(),
  color: z.string().trim().optional(),
  plateNumber: z.string().trim().optional(),
  registrationExpiry: z.string().trim().optional(),
  insuranceExpiry: z.string().trim().optional(),
  fitnessExpiry: z.string().trim().optional(),
});

const applicationDocumentsSchema = z.object({
  nationalId: z.array(documentInputSchema).min(1, "National ID is required"),
  driversLicense: z.array(documentInputSchema).default([]),
  vehicleRegistration: z.array(documentInputSchema).default([]),
  insurance: z.array(documentInputSchema).default([]),
  fitness: z.array(documentInputSchema).default([]),
  profilePhoto: z.array(documentInputSchema).min(1, "Profile photo is required"),
  supporting: z.array(documentInputSchema).default([]),
});

const agreementsSchema = z.object({
  privacyConsent: z.literal(true),
  onboardingConsent: z.literal(true),
  documentReviewConsent: z.literal(true),
  contractorAcknowledgement: z.literal(true),
  platformTermsAcceptance: z.literal(true),
});

const referralInputSchema = z.object({
  referralCode: z.string().trim().optional(),
  inviteToken: z.string().trim().optional(),
  referralSource: z.enum(["code", "invite_link", "none"]).default("none"),
  capturedAt: z.string().trim().optional(),
  landingPage: z.string().trim().optional(),
});

export const publicSlyderApplicationSchema = z
  .object({
    personal: z.object({
      fullName: nonEmpty("Full name is required"),
      email: z.string().trim().email("Valid email is required"),
      phone: nonEmpty("Phone number is required"),
      dateOfBirth: nonEmpty("Date of birth is required"),
      parishTown: nonEmpty("Parish / town is required"),
      address: nonEmpty("Address is required"),
      trn: nonEmpty("TRN is required"),
      emergencyContact: z.string().trim().optional(),
      emergencyContactName: z.string().trim().optional(),
      emergencyContactPhone: z.string().trim().optional(),
    }),
    courier: z.object({
      courierType: z.enum(courierTypes),
    }),
    vehicle: vehicleSchema,
    documents: applicationDocumentsSchema,
    preferences: z.object({
      zones: z.array(z.string().trim()).min(1, "Select at least one preferred zone"),
      availability: nonEmpty("Availability is required"),
      commitment: z.enum(["part-time", "full-time", "flexible"]),
      peakHours: nonEmpty("Peak-hour availability is required"),
      maxTravelComfort: nonEmpty("Max travel comfort is required"),
      deliveryTypes: z.array(z.string().trim()).default([]),
    }),
    readiness: z.object({
      smartphoneType: nonEmpty("Smartphone type is required"),
      whatsappNumber: nonEmpty("WhatsApp number is required"),
      gpsEnabled: z.boolean(),
      dataAccess: z.boolean(),
      safetyGear: z.boolean(),
      insulatedBag: z.boolean(),
      helmetReady: z.boolean(),
      readinessNotes: z.string().trim().optional(),
    }),
    agreements: agreementsSchema,
    referral: referralInputSchema.optional(),
  })
  .superRefine((input, ctx) => {
    const needsVehicle = ["motorcycle", "car", "van", "other"].includes(input.courier.courierType);
    const needsLicense = ["motorcycle", "car", "van"].includes(input.courier.courierType);

    if (needsLicense && input.documents.driversLicense.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documents", "driversLicense"],
        message: "Driver's license is required for this courier type",
      });
    }

    if (needsVehicle && input.documents.vehicleRegistration.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documents", "vehicleRegistration"],
        message: "Vehicle registration is required for this courier type",
      });
    }

    if (needsVehicle && !Object.values(input.vehicle).some(Boolean)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["vehicle"],
        message: "Vehicle details are required for this courier type",
      });
    }
  })
  .transform((input) => {
    const emergencyContactName =
      input.personal.emergencyContactName ||
      input.personal.emergencyContact?.split("|")[0]?.trim() ||
      input.personal.emergencyContact?.split("-")[0]?.trim() ||
      "Not provided";

    const emergencyContactPhone =
      input.personal.emergencyContactPhone ||
      input.personal.emergencyContact?.split("|")[1]?.trim() ||
      input.personal.emergencyContact?.split("-")[1]?.trim() ||
      input.personal.phone;

    return {
      fullName: input.personal.fullName,
      email: input.personal.email.trim().toLowerCase(),
      phone: input.personal.phone.trim(),
      dateOfBirth: input.personal.dateOfBirth,
      parish: input.personal.parishTown,
      address: input.personal.address,
      trn: input.personal.trn,
      emergencyContactName,
      emergencyContactPhone,
      courierType: input.courier.courierType,
      vehicle: input.vehicle,
      workTypePreference: input.preferences.commitment,
      availability: input.preferences.availability,
      preferredZones: Array.from(new Set(input.preferences.zones.map((zone) => zone.trim()).filter(Boolean))),
      deliveryTypePreferences: Array.from(new Set(input.preferences.deliveryTypes.map((type) => type.trim()).filter(Boolean))),
      maxTravelComfort: input.preferences.maxTravelComfort,
      peakHours: input.preferences.peakHours,
      smartphoneType: input.readiness.smartphoneType,
      whatsappNumber: input.readiness.whatsappNumber,
      gpsConfirmed: input.readiness.gpsEnabled,
      internetConfirmed: input.readiness.dataAccess,
      readinessAnswers: {
        safetyGear: input.readiness.safetyGear,
        insulatedBag: input.readiness.insulatedBag,
        helmetReady: input.readiness.helmetReady,
        readinessNotes: input.readiness.readinessNotes ?? "",
      },
      agreementsAccepted: input.agreements,
      documents: input.documents,
      referral:
        input.referral && (input.referral.inviteToken || input.referral.referralCode || input.referral.referralSource !== "none")
          ? {
              referralCode: input.referral.referralCode?.trim() || undefined,
              inviteToken: input.referral.inviteToken?.trim() || undefined,
              referralSource:
                input.referral.inviteToken?.trim()
                  ? "invite_link"
                  : input.referral.referralCode?.trim()
                    ? "code"
                    : input.referral.referralSource,
              capturedAt: input.referral.capturedAt?.trim() || undefined,
              landingPage: input.referral.landingPage?.trim() || undefined,
            }
          : undefined,
    };
  });

export type PublicSlyderApplicationInput = z.infer<typeof publicSlyderApplicationSchema>;

export const applicationListQuerySchema = z.object({
  status: z.enum(applicationStatuses).optional(),
  search: z.string().trim().min(2).optional(),
  sortBy: z.enum(["submittedAt", "updatedAt", "fullName", "applicationCode"]).default("submittedAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(applicationStatuses),
  reviewNotes: z.string().trim().optional(),
});

export const requestDocumentsSchema = z.object({
  requestedDocumentTypes: z.array(z.enum(documentTypes)).min(1),
  notes: nonEmpty("Document request notes are required"),
});
export type RequestDocumentsInput = z.infer<typeof requestDocumentsSchema>;

export const rejectApplicationSchema = z.object({
  reason: nonEmpty("Rejection reason is required"),
});

export const approveApplicationSchema = z.object({
  reviewNotes: z.string().trim().optional(),
  activationChannel: z.enum(["email", "sms", "whatsapp"]).default("email"),
});
export type ApproveApplicationInput = z.infer<typeof approveApplicationSchema>;

export const updateDocumentVerificationSchema = z.object({
  documentId: nonEmpty("Document id is required"),
  verificationStatus: z.enum(documentVerificationStatuses),
  rejectionReason: z.string().trim().optional(),
});

export const loginSchema = z.object({
  identifier: nonEmpty("Email or phone is required"),
  password: nonEmpty("Password is required"),
});

export const verifyOtpSchema = z.object({
  challengeId: nonEmpty("Challenge id is required"),
  code: nonEmpty("OTP code is required"),
});

export const resendOtpSchema = z.object({
  challengeId: nonEmpty("Challenge id is required"),
});

export const activateSchema = z.object({
  token: nonEmpty("Activation token is required"),
});

export const setPasswordSchema = z.object({
  token: nonEmpty("Activation token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const slyderActivationLegalAcceptanceSchema = z.object({
  acceptedDocumentTypes: z.array(z.enum(["slyder_activation_terms", "slyder_privacy_notice"])).min(1),
  understandZoneDependency: z.literal(true),
  understandSetupRequired: z.literal(true),
});
export type SlyderActivationLegalAcceptanceInput = z.infer<typeof slyderActivationLegalAcceptanceSchema>;

export const slyderSetupUpdateSchema = z.object({
  profileComplete: z.boolean().optional(),
  payoutSetupComplete: z.boolean().optional(),
  vehicleVerified: z.boolean().optional(),
  permissionsComplete: z.boolean().optional(),
  requiredAgreementsAccepted: z.boolean().optional(),
  emergencyContactConfirmed: z.boolean().optional(),
  coverageZoneId: z.string().trim().optional(),
});
export type SlyderSetupUpdateInput = z.infer<typeof slyderSetupUpdateSchema>;

export const slyderReadinessUpdateSchema = z.object({
  locationPermissionConfirmed: z.boolean().optional(),
  notificationPermissionConfirmed: z.boolean().optional(),
  equipmentConfirmed: z.boolean().optional(),
  trainingComplete: z.boolean().optional(),
  trainingAcknowledgedAt: z.string().trim().optional(),
  profileConfirmed: z.boolean().optional(),
  vehicleConfirmed: z.boolean().optional(),
  payoutConfigured: z.boolean().optional(),
  legalAccepted: z.boolean().optional(),
  emergencyContactConfirmed: z.boolean().optional(),
});
export type SlyderReadinessUpdateInput = z.infer<typeof slyderReadinessUpdateSchema>;

export const completeSetupSchema = z.object({
  profileComplete: z.boolean().optional(),
  payoutSetupComplete: z.boolean().optional(),
  trainingComplete: z.boolean().optional(),
  requiredAgreementsAccepted: z.boolean().optional(),
  readinessCheckPassed: z.boolean().optional(),
  vehicleVerified: z.boolean().optional(),
  permissionsComplete: z.boolean().optional(),
  emergencyContactConfirmed: z.boolean().optional(),
});
export type CompleteSetupInput = z.infer<typeof completeSetupSchema>;

export const readinessFilterSchema = z.object({
  readinessStatus: z.enum(readinessStatuses).optional(),
  operationalStatus: z.enum(operationalStatuses).optional(),
  accountStatus: z.enum(accountStatuses).optional(),
});

export const zoneLaunchActionSchema = z.object({
  action: z.enum(["mark_live", "pause", "resume"]),
});

export const resendNotificationSchema = z.object({
  notificationId: z.string().trim().optional(),
});
