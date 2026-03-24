import type { LegalActorType, LegalDocumentCategoryKey, LegalDocumentType } from "@/types/backend/onboarding";

export type LegalRegistryItem = {
  documentType: LegalDocumentType;
  categoryKey: LegalDocumentCategoryKey;
  title: string;
  slug: string;
  version: string;
  summary: string;
  excerpt: string;
  requiresAcceptance: boolean;
  actorScopes: LegalActorType[];
  contextKeys: string[];
  content: string[];
};

export const legalCategories = [
  {
    key: "slyder" as const,
    name: "For Slyders",
    description: "Privacy, onboarding, and courier-platform terms for applicants and future Slyder accounts.",
  },
  {
    key: "merchant" as const,
    name: "For Merchants",
    description: "Privacy and onboarding terms for merchants joining SLYDE region by region.",
  },
  {
    key: "global" as const,
    name: "General Policies",
    description: "Website-wide legal documents and platform policies that apply broadly across the public site.",
  },
];

export const legalDocumentsRegistry: LegalRegistryItem[] = [
  {
    documentType: "slyder_privacy_notice",
    categoryKey: "slyder",
    title: "Slyder Applicant Privacy Notice",
    slug: "slyder-privacy",
    version: "2026.03.19",
    summary: "How SLYDE collects, reviews, stores, and protects Slyder applicant data during application, verification, and onboarding.",
    excerpt: "This notice explains how SLYDE handles applicant identity, document, contact, and readiness data.",
    requiresAcceptance: true,
    actorScopes: ["slyder_applicant"],
    contextKeys: ["slyder_application"],
    content: [
      "SLYDE collects personal, contact, document, vehicle, readiness, and onboarding information from Slyder applicants so we can review applications, verify identity, assess zone fit, and determine whether an applicant can move into approval, activation, setup, and readiness.",
      "This information may include your name, date of birth, contact details, address, TRN, emergency contact information, courier type, vehicle information, document uploads, availability, preferred zones, device details, and onboarding or readiness responses.",
      "SLYDE uses this information to manage applicant review, document verification, readiness checks, activation planning, compliance workflows, fraud prevention, support, and future courier operations within the platform.",
      "Applicant information may be stored in secure systems used for onboarding, support, communications, audit logging, and operational controls. Access is limited to SLYDE team members, approved operators, and technology or communication providers who need the information to support the onboarding lifecycle.",
      "SLYDE may share applicant information with service providers that support storage, communication, verification, hosting, security, or compliance. Information may also be disclosed where required by law, lawful request, fraud prevention, or safety response.",
      "Applying to SLYDE may involve communications by email, WhatsApp, phone, SMS, or in-app messaging later in the lifecycle. These communications may include application confirmations, document requests, approval notices, activation instructions, readiness reminders, or support responses.",
      "Applicant information is retained for as long as reasonably needed for onboarding review, compliance, auditability, dispute resolution, security, and future operational recordkeeping.",
      "Questions about applicant privacy may be directed to info@slyde.app or 8765947320.",
    ],
  },
  {
    documentType: "slyder_onboarding_terms",
    categoryKey: "slyder",
    title: "Slyder Application and Onboarding Terms",
    slug: "slyder-onboarding-terms",
    version: "2026.03.19",
    summary: "Launch-stage application and onboarding terms for future Slyders joining the SLYDE network.",
    excerpt: "These terms explain that applying does not guarantee approval, activation, or immediate work.",
    requiresAcceptance: true,
    actorScopes: ["slyder_applicant"],
    contextKeys: ["slyder_application"],
    content: [
      "Submitting a SLYDE application starts a structured review process. It does not guarantee approval, activation, immediate access to the SLYDE app, immediate work opportunities, or launch in your area.",
      "SLYDE launches region by region. Your ability to begin working depends on application approval, document verification, account creation, setup completion, readiness requirements, and your zone reaching launch readiness.",
      "SLYDE may request additional information or documents, pause review, or decline an application where information is incomplete, requirements are not met, or operational fit is not sufficient.",
      "If approved, SLYDE may create a courier account, issue activation instructions, and require you to complete additional setup or onboarding requirements before you become eligible for delivery work.",
      "SLYDE may update onboarding requirements, activation steps, or future courier terms as the logistics network grows. Additional courier or independent contractor terms may be required before certain operational access is granted.",
      "Applicants must provide accurate information and keep contact details current so SLYDE can communicate about onboarding, approvals, launch timing, and readiness status.",
    ],
  },
  {
    documentType: "slyder_activation_terms",
    categoryKey: "slyder",
    title: "SLYDE Final Courier Terms",
    slug: "slyder-final-courier-terms",
    version: "2026.03.19",
    summary: "Final post-approval terms that govern Slyder account activation, setup, readiness, and operational eligibility.",
    excerpt: "These terms apply after approval and before a Slyder can become eligible to go online.",
    requiresAcceptance: true,
    actorScopes: ["slyder_user"],
    contextKeys: ["slyder_activation"],
    content: [
      "These Final Courier Terms apply after SLYDE approves an applicant and offers activation access to a Slyder account. Approval alone does not make a person operationally eligible to perform deliveries.",
      "An approved Slyder must complete activation, accept the current required legal documents, complete setup, complete readiness requirements, and satisfy any operational verification steps before SLYDE may allow the account to go online.",
      "SLYDE may require confirmation of profile details, contact details, emergency contact details, vehicle details, equipment readiness, training acknowledgment, permissions awareness, payout setup, and any other reasonable onboarding steps needed to support safe and reliable operations.",
      "A Slyder may be fully onboarded but still unable to receive work if the assigned area or coverage zone is not yet live, is paused, or is otherwise unavailable for operations. SLYDE controls launch timing zone by zone.",
      "SLYDE may suspend, delay, restrict, or block operational access where readiness requirements are not met, documents are incomplete or invalid, account controls are triggered, or operational conditions require additional review.",
      "Operational access to the SLYDE network does not guarantee any minimum amount of work, earnings, launch timing, or courier volume. Access depends on service demand, launch status, operational controls, and platform requirements.",
      "By accepting these terms, you agree to use the SLYDE platform responsibly, follow delivery and customer-service expectations, maintain accurate account information, and comply with all additional platform instructions that apply to courier operations.",
    ],
  },
  {
    documentType: "merchant_privacy_notice",
    categoryKey: "merchant",
    title: "Merchant Privacy Notice",
    slug: "merchant-privacy",
    version: "2026.03.19",
    summary: "How SLYDE collects, uses, stores, and protects merchant and business-contact information during waitlist, onboarding, and launch review.",
    excerpt: "This notice explains how SLYDE handles merchant and business-contact data during staged launch and onboarding.",
    requiresAcceptance: true,
    actorScopes: ["merchant_interest", "merchant_user"],
    contextKeys: ["merchant_interest", "merchant_onboarding"],
    content: [
      "SLYDE collects business and contact information from merchants that submit interest, join the waitlist, or move into onboarding. This can include business name, contact person details, email address, phone number, WhatsApp number, service area information, business address, operational notes, and any additional onboarding details you provide.",
      "We collect this information so we can evaluate service fit, assess launch readiness by parish and zone, communicate about onboarding, review whether your area is close to activation, and prepare future merchant operations on the SLYDE platform.",
      "SLYDE may use merchant information to contact your team by email, phone, or WhatsApp about onboarding progress, requested details, launch timing, service availability, support issues, and future platform setup.",
      "Merchant information may be stored in secure operational systems used by SLYDE to manage onboarding, waitlist review, launch control, account setup, and service activation. Access is limited to team members, approved operators, and service providers that need the information to support platform operations, communications, hosting, storage, or compliance.",
      "Where necessary, SLYDE may share merchant information with technology vendors, communication providers, payment or onboarding service providers, or legal and regulatory authorities where disclosure is required for compliance, security, fraud prevention, or lawful process.",
      "SLYDE keeps merchant information for as long as it is reasonably needed to manage business inquiries, onboarding records, operational setup, legal obligations, dispute resolution, internal review, and platform security. Retention periods may vary depending on whether your business stays on the waitlist, becomes active, or stops onboarding.",
      "Questions about merchant privacy may be directed to info@slyde.app or 8765947320.",
    ],
  },
  {
    documentType: "merchant_interest_terms",
    categoryKey: "merchant",
    title: "Merchant Interest and Onboarding Terms",
    slug: "merchant-onboarding-terms",
    version: "2026.03.19",
    summary: "Launch-stage terms for businesses joining the SLYDE waitlist, onboarding queue, and future merchant platform.",
    excerpt: "These terms explain the region-by-region launch model and that inquiry submission does not guarantee immediate activation.",
    requiresAcceptance: true,
    actorScopes: ["merchant_interest", "merchant_user"],
    contextKeys: ["merchant_interest", "merchant_onboarding"],
    content: [
      "Submitting a merchant inquiry to SLYDE means you are asking to be considered for onboarding, waitlist placement, launch planning, or future service activation. It does not create an immediate service agreement and does not guarantee approval, activation, or live delivery coverage.",
      "SLYDE launches region by region. Merchant activation depends on zone readiness, courier network strength, operational support, launch control decisions, and any other internal requirements SLYDE uses to protect service quality and launch reliability.",
      "A merchant may be prelaunch-ready, waitlisted, invited to onboarding, or delayed until a zone becomes operationally viable. SLYDE may delay, pause, or decline merchant activation where coverage, readiness, compliance, or operational support is not sufficient.",
      "You agree to provide accurate, current, and complete information during the inquiry and onboarding process. SLYDE may request additional information, documents, operational details, or commercial information before onboarding continues.",
      "Merchant onboarding may occur in stages. SLYDE may first collect waitlist information, later invite a business into onboarding, and then require additional legal, commercial, or platform terms before activation.",
      "SLYDE does not guarantee immediate access to live deliveries before a zone is launched. Even after a business is reviewed or approved in principle, activation may remain pending until the area is launch-ready and operational controls are in place.",
    ],
  },
  {
    documentType: "website_privacy_policy",
    categoryKey: "global",
    title: "Website Privacy Policy",
    slug: "privacy",
    version: "2026.03.19",
    summary: "How SLYDE handles information submitted through the public website.",
    excerpt: "This policy explains how SLYDE handles public website application, inquiry, and contact data.",
    requiresAcceptance: false,
    actorScopes: ["public_user", "slyder_applicant", "merchant_interest"],
    contextKeys: ["public_signup"],
    content: [
      "SLYDE collects personal, business, and inquiry information submitted through this website to review applications, respond to contact requests, evaluate partnerships, and support future logistics operations.",
      "Slyder application data can include identification details, contact information, courier type, vehicle details, document metadata, availability, and readiness information. This data is used to assess whether an applicant can move into review, approval, account activation, and later work eligibility.",
      "Business and API inquiry data is used to evaluate service fit, partnership opportunity, and future integration planning. Information may be retained for operational follow-up, legal compliance, internal review, and platform onboarding.",
      "As backend services are connected, SLYDE may use secure storage, access controls, verification tools, and audit workflows to protect submitted information and manage the approval-to-login lifecycle responsibly.",
    ],
  },
  {
    documentType: "website_terms_of_use",
    categoryKey: "global",
    title: "Website Terms of Use",
    slug: "terms",
    version: "2026.03.19",
    summary: "Terms that apply to use of the SLYDE public website.",
    excerpt: "These terms explain how applications, inquiries, and public-site use are handled by SLYDE.",
    requiresAcceptance: false,
    actorScopes: ["public_user", "slyder_applicant", "merchant_interest"],
    contextKeys: ["public_signup"],
    content: [
      "By using the SLYDE public website, you agree to provide accurate information in any application, inquiry, or contact submission. Submission of a form does not guarantee approval, activation, partnership, or access to any platform feature.",
      "Slyder applicants understand that website submission begins a review process only. Work eligibility depends on review, document verification, approval, account creation, activation, setup completion, readiness checks, and any further operational requirements set by SLYDE.",
      "Businesses and partners understand that service availability, coverage, pricing, and integration scope may vary by geography, demand profile, operational readiness, and contractual agreement.",
      "SLYDE may update website content, service positioning, workflows, and legal terms as the logistics network evolves. Continued use of the website indicates acceptance of the current terms.",
    ],
  },
];

export const slyderLegalCheckboxes = {
  privacyNotice: "I have read the Slyder Applicant Privacy Notice.",
  onboardingTerms: "I have read and agree to the Slyder Application and Onboarding Terms.",
  activationTerms: "I have read and agree to the SLYDE Final Courier Terms.",
} as const;

export const merchantLegalCheckboxes = {
  accuracy: "I confirm the information provided is accurate.",
  contactConsent: "I agree that SLYDE may contact me regarding my business inquiry, onboarding, launch readiness, and service availability.",
  noGuarantee: "I understand that submitting this form does not guarantee immediate activation or live service in my area.",
  onboardingTerms: "I have read and agree to the Merchant Interest and Onboarding Terms.",
  privacyNotice: "I have read the Merchant Privacy Notice.",
} as const;

export function getLegalRegistryItem(documentType: LegalDocumentType) {
  return legalDocumentsRegistry.find((item) => item.documentType === documentType);
}

export function getLegalRegistryBySlug(slug: string) {
  return legalDocumentsRegistry.find((item) => item.slug === slug);
}
