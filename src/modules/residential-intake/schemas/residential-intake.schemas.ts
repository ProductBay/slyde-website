import { z } from "zod";

const nonEmpty = (message: string) => z.string().trim().min(1, message);

export const jamaicaParishes = [
  "Kingston",
  "St. Andrew",
  "St. Thomas",
  "Portland",
  "St. Mary",
  "St. Ann",
  "Trelawny",
  "St. James",
  "Hanover",
  "Westmoreland",
  "St. Elizabeth",
  "Manchester",
  "Clarendon",
  "St. Catherine",
] as const;

export const parcelCategories = [
  "documents",
  "small_package",
  "medium_package",
  "large_package",
  "fragile",
  "food",
  "other",
] as const;

export const urgencyOptions = ["asap", "today", "scheduled"] as const;
export const paymentPreferenceOptions = ["wallet", "card", "slyde_gift_card", "adash_scan_to_pay"] as const;

export const CONSENT_VERSION = "residential-v1.0";

// ─── Step 1: Personal & Location ──────────────────────────────────────────────

export const residentialLeadSchema = z.object({
  fullName: nonEmpty("Full name is required"),
  phone: nonEmpty("Phone number is required")
    .regex(/^(\+?1?876)?[\s.-]?\(?\d{3}\)?[\s.-]?\d{4}[\s.-]?\d{4}$|^\+?1?876\d{7}$|^\d{7,10}$/, {
      message: "Please enter a valid Jamaican phone number",
    })
    .transform((v) => v.replace(/[\s.()\-]/g, "")),
  email: z.string().trim().email("Please enter a valid email address").optional().or(z.literal("")),
  parish: z.enum(jamaicaParishes, { errorMap: () => ({ message: "Please select a parish" }) }),
  area: nonEmpty("Area or community is required").max(120),
});

// ─── Step 2: Pickup address ────────────────────────────────────────────────────

export const residentialPickupSchema = z.object({
  pickupAddress: nonEmpty("Pickup address is required").max(300),
  liveLocationPing: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracyMeters: z.number().positive().max(5000).optional(),
      capturedAt: z.string().datetime(),
    })
    .optional(),
});

// ─── Step 3: Delivery details ─────────────────────────────────────────────────

export const residentialDeliverySchema = z.object({
  dropoffParish: z.enum(jamaicaParishes, { errorMap: () => ({ message: "Please select a dropoff parish" }) }),
  dropoffArea: nonEmpty("Dropoff area or community is required").max(120),
  dropoffAddress: nonEmpty("Dropoff address is required").max(300),
  parcelCategory: z.enum(parcelCategories, { errorMap: () => ({ message: "Please select a parcel type" }) }),
  parcelNotes: z.string().trim().max(400).optional(),
  urgency: z.enum(urgencyOptions, { errorMap: () => ({ message: "Please select urgency" }) }),
  preferredWindow: z.string().trim().max(120).optional(),
});

// ─── Step 4: Preferences & consent ────────────────────────────────────────────

export const residentialPreferencesSchema = z.object({
  paymentPreference: z.enum(paymentPreferenceOptions, {
    errorMap: () => ({ message: "Please select a payment preference" }),
  }),
  privacyAccepted: z.literal(true, { errorMap: () => ({ message: "You must accept the privacy notice" }) }),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
});

// ─── Full intake (all steps merged) ───────────────────────────────────────────

export const residentialIntakeSchema = residentialLeadSchema
  .merge(residentialPickupSchema)
  .merge(residentialDeliverySchema)
  .merge(residentialPreferencesSchema);

export type ResidentialIntakeInput = z.infer<typeof residentialIntakeSchema>;
export type ResidentialLeadInput = z.infer<typeof residentialLeadSchema>;
export type ResidentialPickupInput = z.infer<typeof residentialPickupSchema>;
export type ResidentialDeliveryInput = z.infer<typeof residentialDeliverySchema>;
export type ResidentialPreferencesInput = z.infer<typeof residentialPreferencesSchema>;

// ─── Resident KYC / Account Verification ──────────────────────────────────────

export const residentIdTypes = [
  "national_id",
  "drivers_license",
  "passport",
  "voters_id",
  "other",
] as const;

export const residentIdTypeLabels: Record<(typeof residentIdTypes)[number], string> = {
  national_id: "National Identification Card",
  drivers_license: "Driver's Licence",
  passport: "Passport",
  voters_id: "Voter's ID Card",
  other: "Other Government-Issued ID",
};

export const residentialKycSchema = z.object({
  trn: nonEmpty("TRN is required")
    .regex(/^\d{9}$/, { message: "TRN must be exactly 9 digits" }),
  idType: z.enum(residentIdTypes, { errorMap: () => ({ message: "Please select an ID type" }) }),
});

export type ResidentialKycInput = z.infer<typeof residentialKycSchema>;
