import { SuccessState } from "@/components/site/success-state";

export default function BusinessInquirySuccessPage() {
  return (
    <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
      <SuccessState
        title="Business inquiry received"
        supportLine="Your merchant interest has been logged for waitlist and onboarding review."
        description="A member of the SLYDE team may contact you regarding onboarding, waitlist status, launch readiness in your area, or any additional details needed to continue review."
        highlights={[
          "Your business inquiry has entered the SLYDE merchant review workflow.",
          "Your legal acknowledgments have been recorded against the current merchant document versions.",
          "Service availability will depend on zone readiness, courier coverage, and launch control decisions.",
          "Submitting interest does not guarantee immediate activation in your area.",
        ]}
        footerNote="SLYDE onboards merchants region by region so service can launch with stronger courier coverage and operational reliability."
        actions={[
          { href: "/for-businesses", label: "Back to Businesses", variant: "secondary" },
          { href: "/", label: "Return Home", variant: "primary" },
        ]}
      />
    </section>
  );
}
