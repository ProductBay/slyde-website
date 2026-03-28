import { z } from "zod";

const nonEmpty = (message: string) => z.string().trim().min(1, message);

export const employeeLoginSchema = z.object({
  identifier: nonEmpty("Email or phone is required"),
  password: nonEmpty("Password is required"),
});

export const employeeOnboardingSchema = z.object({
  emergencyContactName: nonEmpty("Emergency contact name is required"),
  emergencyContactPhone: nonEmpty("Emergency contact phone is required"),
  payoutMethod: z.enum(["bank_transfer", "cash_pickup", "mobile_wallet"]),
  payoutAccountMasked: nonEmpty("Payout account or destination is required"),
  acknowledgeHandbook: z.literal(true),
  acknowledgePayrollVisibility: z.literal(true),
});

export const employeeApplicationSchema = z.object({
  fullName: nonEmpty("Full name is required"),
  email: z.string().trim().email("Valid email is required"),
  phone: nonEmpty("Phone number is required"),
  roleInterest: nonEmpty("Role interest is required"),
  departmentInterest: z.enum(["logistics", "operations", "support", "finance", "hr", "leadership"]),
  employmentType: z.enum(["full_time", "part_time", "contract"]),
  location: nonEmpty("Location is required"),
  experienceSummary: nonEmpty("Experience summary is required"),
  managerTrackInterest: z.boolean().optional(),
});

export const employeeApplicationInviteSchema = z.object({
  reviewNotes: z.string().trim().optional(),
});

export const employeeApplicationRejectSchema = z.object({
  reason: nonEmpty("Rejection reason is required"),
});

export const employeeSetPasswordSchema = z.object({
  token: nonEmpty("Activation token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type EmployeeLoginInput = z.infer<typeof employeeLoginSchema>;
export type EmployeeOnboardingInput = z.infer<typeof employeeOnboardingSchema>;
export type EmployeeApplicationInput = z.infer<typeof employeeApplicationSchema>;
export type EmployeeApplicationInviteInput = z.infer<typeof employeeApplicationInviteSchema>;
export type EmployeeApplicationRejectInput = z.infer<typeof employeeApplicationRejectSchema>;
export type EmployeeSetPasswordInput = z.infer<typeof employeeSetPasswordSchema>;
