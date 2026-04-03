import { z } from "zod";

const nonEmpty = (message: string) => z.string().trim().min(1, message);

export const merchantPaymentTypeSchema = z.enum(["prepaid", "cash_on_delivery"]);
export const merchantRequestedTimingSchema = z.enum(["asap", "scheduled"]);
export const merchantDeliveryStatusSchema = z.enum([
  "draft",
  "submitted",
  "quoted",
  "accepted",
  "rider_assigned",
  "picked_up",
  "in_transit",
  "arrived",
  "delivered",
  "failed",
  "cancelled",
]);

export const quickDispatchSchema = z
  .object({
    deliveryType: z.enum(["in_parish", "out_of_parish"]).default("in_parish"),
    customerName: nonEmpty("Customer name is required"),
    customerPhone: nonEmpty("Customer phone is required"),
    deliveryAddress: nonEmpty("Delivery address is required"),
    pickupLocationId: z.string().trim().optional(),
    pickupAddress: z.string().trim().optional(),
    itemDescription: nonEmpty("Item description is required"),
    packageType: nonEmpty("Package type is required"),
    paymentType: merchantPaymentTypeSchema,
    codAmount: z.coerce.number().nonnegative().optional(),
    deliveryTiming: merchantRequestedTimingSchema,
    scheduledFor: z.string().trim().optional(),
    destinationParish: z.string().trim().optional(),
    destinationTown: z.string().trim().optional(),
    transferPartnerId: z.string().trim().optional(),
    partnerHandoffLocationId: z.string().trim().optional(),
    finalFulfillmentMethod: z.enum(["customer_collection", "partner_final_delivery", "slyde_final_mile"]).optional(),
    packageValue: z.coerce.number().nonnegative().optional(),
    specialHandlingNotes: z.string().trim().max(500).optional(),
    riderNote: z.string().trim().max(300).optional(),
    internalNote: z.string().trim().max(300).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.pickupLocationId && !value.pickupAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a saved pickup location or enter a pickup address.",
        path: ["pickupLocationId"],
      });
    }

    if (value.paymentType === "cash_on_delivery" && (value.codAmount === undefined || Number.isNaN(value.codAmount))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "COD amount is required for cash on delivery.",
        path: ["codAmount"],
      });
    }

    if (value.deliveryTiming === "scheduled" && !value.scheduledFor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled time is required.",
        path: ["scheduledFor"],
      });
    }

    if (value.deliveryType === "out_of_parish") {
      if (!value.destinationParish) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Destination parish is required for out-of-parish delivery.",
          path: ["destinationParish"],
        });
      }
      if (!value.transferPartnerId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Transfer partner is required for out-of-parish delivery.",
          path: ["transferPartnerId"],
        });
      }
      if (!value.finalFulfillmentMethod) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Final fulfillment method is required for out-of-parish delivery.",
          path: ["finalFulfillmentMethod"],
        });
      }
    }
  });

export const structuredDispatchSchema = z.object({
  orderNumber: z.string().trim().optional(),
  savedCustomerAddressId: z.string().trim().optional(),
  savedPickupLocationId: z.string().trim().optional(),
  packageCategory: nonEmpty("Package category is required"),
  declaredValue: z.coerce.number().nonnegative().optional(),
  codAmount: z.coerce.number().nonnegative().optional(),
  internalNote: z.string().trim().max(300).optional(),
  riderNote: z.string().trim().max(300).optional(),
  deliveryTiming: merchantRequestedTimingSchema,
  scheduledFor: z.string().trim().optional(),
});

export const merchantOrderFiltersSchema = z.object({
  status: merchantDeliveryStatusSchema.optional(),
  paymentType: merchantPaymentTypeSchema.optional(),
  pickupLocationId: z.string().trim().optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export const merchantDeliveriesFiltersSchema = z.object({
  range: z.enum(["today", "last_7_days", "last_30_days"]).optional(),
  status: merchantDeliveryStatusSchema.optional(),
  pickupLocationId: z.string().trim().optional(),
  paymentType: merchantPaymentTypeSchema.optional(),
  search: z.string().trim().optional(),
});

export type QuickDispatchInput = z.infer<typeof quickDispatchSchema>;
export type StructuredDispatchInput = z.infer<typeof structuredDispatchSchema>;
export type MerchantOrderFiltersInput = z.infer<typeof merchantOrderFiltersSchema>;
export type MerchantDeliveriesFiltersInput = z.infer<typeof merchantDeliveriesFiltersSchema>;
