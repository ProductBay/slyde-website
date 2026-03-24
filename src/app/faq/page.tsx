import type { Metadata } from "next";
import { faqs } from "@/content/site";
import { FAQAccordion } from "@/components/site/faq-accordion";
import { HeroSection } from "@/components/site/hero-section";
import { PaymentFaqGroup } from "@/components/site/payment-faq-group";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "FAQ",
  "Browse SLYDE frequently asked questions for general visitors, Slyders, businesses, and API partners.",
  "/faq",
);

export default function FAQPage() {
  return (
    <>
      <HeroSection
        eyebrow="FAQ"
        title="Answers for Slyders, businesses, and integration partners"
        description="This FAQ reflects the actual public-site role of SLYDE: brand platform, recruitment funnel, business acquisition channel, and future partner integration entry point."
        actions={[
          { href: "/contact", label: "Contact SLYDE" },
          { href: "/become-a-slyder/apply", label: "Apply as a Slyder", variant: "secondary" },
        ]}
      />
      <section className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
        <FAQAccordion categories={faqs} />
      </section>
      <PaymentFaqGroup
        sectionId="faq-slyder-payouts-digital-payments"
        title="Slyder payouts and digital payment support"
        items={[
          {
            id: "faq-how-slyders-get-paid",
            question: "How do Slyders get paid?",
            answer: "SLYDE is building a structured payout experience for delivery partners. Earnings are tracked through the platform, and eligible payout methods are configured during onboarding and account setup. The goal is to give Slyders better visibility into earnings, withdrawals, and payout readiness.",
          },
          {
            id: "faq-support-lynk-payouts",
            question: "Will SLYDE support Lynk payouts for Slyders?",
            answer: "SLYDE is preparing supported digital payout workflows that may include Lynk as part of the payout and operations model for eligible Slyders. Availability may depend on rollout phase, verification requirements, and operational readiness.",
          },
          {
            id: "faq-digital-payouts-useful",
            question: "Why are digital payout methods useful for Slyders?",
            answer: "Digital payout methods can help reduce dependence on cash, improve payout visibility, and support a more modern delivery workflow. They can also play an important role in future errand jobs that require more structured payment handling.",
          },
          {
            id: "faq-need-lynk-before-apply",
            question: "Do I need a Lynk account to apply as a Slyder?",
            answer: "No. You do not need every payout setup detail in place before you apply. Application and approval come first. Any supported payout setup steps are typically introduced during onboarding.",
          },
          {
            id: "faq-digital-payments-for-errands",
            question: "Can Slyders use digital payments for errands?",
            answer: "SLYDE is designing safer, more structured errand workflows for tasks that may involve in-person payments or purchases. Supported digital rails can help improve trust, proof, and accountability for these tasks as the system expands.",
          },
          {
            id: "faq-all-errands-require-digital-payment",
            question: "Will all errands require digital payment?",
            answer: "Not necessarily. Operational requirements may vary depending on the errand type, merchant, customer needs, and rollout phase. SLYDE’s goal is to support safer and more reliable workflows where digital payment options make sense.",
          },
          {
            id: "faq-why-building-this",
            question: "Why is SLYDE building this into the platform?",
            answer: "Because stronger payout systems and cleaner errand payment workflows help create a better experience for Slyders, customers, and business partners. It supports trust, reduces confusion, and helps the network grow more professionally.",
          },
        ]}
      />
    </>
  );
}
