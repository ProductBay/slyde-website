import { z } from "zod";

const optionalString = z.string().trim().optional();
const optionalStringList = z.array(z.string().trim().min(1)).optional();
const mediaUrlSchema = z
  .string()
  .trim()
  .max(8_000_000, "Image source is too long.")
  .refine(
    (value) => value === "" || /^https?:\/\//i.test(value) || /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(value),
    "Enter a valid image URL or upload an image file.",
  )
  .optional()
  .or(z.literal(""));
const operatingHoursSchema = z
  .object({
    days: z.array(z.string().trim().min(1)).optional(),
    openTime: z.string().trim().optional(),
    closeTime: z.string().trim().optional(),
    summary: z.string().trim().optional(),
  })
  .optional();

export const merchantSettingsSchema = z.object({
  businessName: optionalString,
  contactName: optionalString,
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  phone: optionalString,
  parish: optionalString,
  town: optionalString,
  category: optionalString,
  instagramHandle: optionalString,
  website: z.string().trim().url("Enter a valid website URL").optional().or(z.literal("")),
  orderChannels: optionalStringList,
  averageDailyOrders: optionalString,
  currentDeliveryMethod: optionalString,
  preferredStartTimeline: optionalString,
  storeName: optionalString,
  logoUrl: mediaUrlSchema,
  heroBannerUrl: mediaUrlSchema,
  heroBannerPosition: z.enum(["left", "center", "right"]).optional(),
  businessDescription: z.string().trim().max(1200).optional(),
  pickupAddress: optionalString,
  serviceAreas: optionalStringList,
  fulfillmentMode: optionalString,
  operatingHours: operatingHoursSchema,
  businessLicenseNumber: z.string().trim().max(120).optional(),
  defaultPickupLocationId: z.string().trim().optional(),
  dispatchMode: z.enum(["manual_dashboard", "whatsapp_assisted", "api_later"]).optional(),
  acceptsCOD: z.boolean().optional(),
  averageBasketSize: optionalString,
  packageTypes: optionalStringList,
  orderSources: optionalStringList,
  pickupLocations: optionalStringList,
  deliveryRadius: optionalString,
  sameDaySupported: z.boolean().optional(),
  scheduledSupported: z.boolean().optional(),
  defaultDeliveryInstruction: z.string().trim().max(300).optional(),
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
  notifyOnAssigned: z.boolean().optional(),
  notifyOnDelivered: z.boolean().optional(),
  notifyOnFailed: z.boolean().optional(),
  notifyOnBilling: z.boolean().optional(),
});

export type MerchantSettingsInput = z.infer<typeof merchantSettingsSchema>;
