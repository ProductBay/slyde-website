export type EmployeeAudience = "all_staff" | "field_courier" | "operations_admin" | "support_staff";

export type EmployeeDocumentCategory = {
  id: string;
  label: string;
  description: string;
};

export type EmployeeDocument = {
  slug: string;
  title: string;
  summary: string;
  categoryId: string;
  audiences: EmployeeAudience[];
  href: string;
  formatLabel: string;
  estimatedRead: string;
  status: "live" | "coming_soon";
};

export const employeeAudienceLabels: Record<EmployeeAudience, { label: string; description: string }> = {
  all_staff: {
    label: "All employees",
    description: "Shared standards, handbook guidance, and platform-wide operating rules.",
  },
  field_courier: {
    label: "Field couriers",
    description: "On-road onboarding, readiness, safety, and day-to-day execution guidance.",
  },
  operations_admin: {
    label: "Operations admins",
    description: "Control-tower workflows, approvals, escalation handling, and audit visibility.",
  },
  support_staff: {
    label: "Support staff",
    description: "Activation support, employee assistance, and communication follow-up workflows.",
  },
};

export const employeeDocumentCategories: EmployeeDocumentCategory[] = [
  {
    id: "core",
    label: "Core handbook",
    description: "Primary operational doctrine, employee expectations, and process flow.",
  },
  {
    id: "onboarding",
    label: "Onboarding and setup",
    description: "Activation, legal acceptance, profile completion, and readiness work.",
  },
  {
    id: "operations",
    label: "Daily operations",
    description: "Execution references for active field teams and internal support functions.",
  },
  {
    id: "compliance",
    label: "Compliance and accountability",
    description: "Signed terms, legal requirements, and readiness checkpoints.",
  },
];

export const employeeDocuments: EmployeeDocument[] = [
  {
    slug: "operations-manual",
    title: "Employee operations manual",
    summary: "The internal handbook for operating the SLYDE website, approvals, onboarding, readiness, and escalation.",
    categoryId: "core",
    audiences: ["all_staff", "field_courier", "operations_admin", "support_staff"],
    href: "/employee-hub/handbook",
    formatLabel: "Digital handbook",
    estimatedRead: "20 sections",
    status: "live",
  },
  {
    slug: "setup-workflow",
    title: "Profile and setup workflow",
    summary: "The active setup flow employees complete after login, including profile and device readiness requirements.",
    categoryId: "onboarding",
    audiences: ["field_courier"],
    href: "/slyder/onboarding/setup",
    formatLabel: "Live workflow",
    estimatedRead: "Task flow",
    status: "live",
  },
  {
    slug: "legal-acceptance",
    title: "Legal acceptance center",
    summary: "Required legal acknowledgements and active SLYDE terms for onboarding completion.",
    categoryId: "compliance",
    audiences: ["field_courier"],
    href: "/slyder/onboarding/legal",
    formatLabel: "Action page",
    estimatedRead: "Required step",
    status: "live",
  },
  {
    slug: "readiness-checklist",
    title: "Readiness checklist",
    summary: "Operational readiness confirmations covering equipment, permissions, emergency contact, and training.",
    categoryId: "operations",
    audiences: ["field_courier"],
    href: "/slyder/onboarding/readiness",
    formatLabel: "Checklist",
    estimatedRead: "Final review",
    status: "live",
  },
  {
    slug: "support-playbooks",
    title: "Support and escalation playbooks",
    summary: "Structured response guides for account access, document issues, and employee support interventions.",
    categoryId: "operations",
    audiences: ["support_staff", "operations_admin"],
    href: "/employee-hub/handbook#19-escalation-rules",
    formatLabel: "Hub section",
    estimatedRead: "Escalation reference",
    status: "coming_soon",
  },
];
