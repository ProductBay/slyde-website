import { z } from "zod";

export const courierTypes = [
  "bicycle",
  "motorcycle",
  "car",
  "van",
  "walker",
  "other",
] as const;

export const businessTypes = [
  "merchant",
  "marketplace",
  "restaurant",
  "pharmacy",
  "retailer",
  "enterprise",
  "other",
] as const;

export const deliveryPreferences = [
  "food",
  "retail",
  "pharmacy",
  "errands",
  "documents",
  "bulk",
] as const;

const nonEmpty = (message: string) => z.string().trim().min(1, message);
const relativeOrAbsoluteUrl = z.string().trim().refine(
  (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
  "Invalid url",
);

const fileMetaSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  fileUrl: relativeOrAbsoluteUrl.optional(),
  storageKey: z.string().trim().optional(),
});

const referralSchema = z.object({
  referralCode: z.string().trim().optional(),
  inviteToken: z.string().trim().optional(),
  referralSource: z.enum(["code", "invite_link", "none"]).default("none"),
  capturedAt: z.string().trim().optional(),
  landingPage: z.string().trim().optional(),
});

export const slyderApplicationSchema = z.object({
  personal: z.object({
    fullName: nonEmpty("Full name is required"),
    email: z.string().trim().email("Enter a valid email"),
    phone: nonEmpty("Phone number is required"),
    dateOfBirth: nonEmpty("Date of birth is required"),
    parishTown: nonEmpty("Parish or town is required"),
    address: nonEmpty("Address is required"),
    trn: nonEmpty("TRN is required"),
    emergencyContact: nonEmpty("Emergency contact is required"),
  }),
  courier: z.object({
    courierType: z.enum(courierTypes),
  }),
  vehicle: z.object({
    make: z.string().trim(),
    model: z.string().trim(),
    year: z.string().trim(),
    color: z.string().trim(),
    plateNumber: z.string().trim(),
    registrationExpiry: z.string().trim(),
    insuranceExpiry: z.string().trim(),
    fitnessExpiry: z.string().trim(),
  }),
  documents: z.object({
    nationalId: z.array(fileMetaSchema).min(1, "Upload at least one ID file"),
    driversLicense: z.array(fileMetaSchema).default([]),
    vehicleRegistration: z.array(fileMetaSchema).default([]),
    insurance: z.array(fileMetaSchema).default([]),
    fitness: z.array(fileMetaSchema).default([]),
    profilePhoto: z.array(fileMetaSchema).min(1, "Upload a profile photo"),
    supporting: z.array(fileMetaSchema).default([]),
  }),
  preferences: z.object({
    zones: z.array(z.string()).min(1, "Select at least one zone"),
    availability: nonEmpty("Availability is required"),
    commitment: z.enum(["part-time", "full-time", "flexible"]),
    peakHours: nonEmpty("Peak-hour availability is required"),
    maxTravelComfort: nonEmpty("Max travel comfort is required"),
    deliveryTypes: z.array(z.enum(deliveryPreferences)).min(1, "Choose at least one delivery type"),
  }),
  readiness: z.object({
    smartphoneType: nonEmpty("Smartphone type is required"),
    whatsappNumber: nonEmpty("WhatsApp number is required"),
    gpsEnabled: z.boolean().refine(Boolean, "GPS confirmation is required"),
    dataAccess: z.boolean().refine(Boolean, "Data access confirmation is required"),
    safetyGear: z.boolean(),
    insulatedBag: z.boolean(),
    helmetReady: z.boolean(),
    readinessNotes: z.string().trim(),
  }),
  agreements: z.object({
    privacyConsent: z.boolean().refine(Boolean, "Privacy consent is required"),
    onboardingConsent: z.boolean().refine(Boolean, "Onboarding consent is required"),
    documentReviewConsent: z.boolean().refine(Boolean, "Document review consent is required"),
    contractorAcknowledgement: z.boolean().refine(Boolean, "Acknowledgement is required"),
    platformTermsAcceptance: z.boolean().refine(Boolean, "Terms acceptance is required"),
  }),
  referral: referralSchema.default({
    referralCode: "",
    inviteToken: "",
    referralSource: "none",
  }),
});

export type SlyderApplicationDraft = z.infer<typeof slyderApplicationSchema>;

export const businessInquirySchema = z.object({
  companyName: nonEmpty("Company name is required"),
  contactName: nonEmpty("Contact name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: nonEmpty("Phone number is required"),
  businessType: z.enum(businessTypes),
  deliveryVolume: nonEmpty("Delivery volume is required"),
  coverageNeeds: nonEmpty("Coverage needs are required"),
  goals: nonEmpty("Tell us what you need"),
  legal: z.object({
    accuracyConfirmed: z.boolean().refine(Boolean, "You must confirm the information is accurate."),
    contactConsent: z.boolean().refine(Boolean, "You must allow SLYDE to contact you about onboarding."),
    noGuaranteeAcknowledgement: z.boolean().refine(Boolean, "You must acknowledge that submission does not guarantee immediate activation."),
    acceptedDocumentTypes: z.array(z.enum(["merchant_privacy_notice", "merchant_interest_terms"])).min(2, "You must accept the required merchant legal documents."),
  }),
});

export type BusinessInquiryInput = z.infer<typeof businessInquirySchema>;

export const apiAccessSchema = z.object({
  companyName: nonEmpty("Company name is required"),
  contactName: nonEmpty("Contact name is required"),
  email: z.string().trim().email("Enter a valid email"),
  platformType: nonEmpty("Platform type is required"),
  monthlyVolume: nonEmpty("Monthly volume is required"),
  integrationNeeds: nonEmpty("Integration needs are required"),
  webhookNeeds: z.boolean(),
});

export type ApiAccessInput = z.infer<typeof apiAccessSchema>;

export const contactSchema = z.object({
  name: nonEmpty("Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  topic: nonEmpty("Topic is required"),
  message: nonEmpty("Message is required"),
});

export type ContactInput = z.infer<typeof contactSchema>;
