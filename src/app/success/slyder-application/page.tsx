import { SuccessState } from "@/components/site/success-state";

export default function SlyderApplicationSuccessPage() {
  return (
    <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
      <SuccessState
        title="Application received"
        supportLine="You're now part of the SLYDE onboarding network."
        description="Thanks for applying to become a Slyder. Your application has been successfully submitted for review."
        highlights={[
          "You'll receive a WhatsApp confirmation message.",
          "You'll receive an email with your application details.",
          "Our team will review your submission.",
          "We'll contact you if any additional information is needed.",
        ]}
        areaStatus={{
          heading: "Your area status",
          title: "Your zone is building toward launch",
          description: "Stay ready. Early applicants are best positioned as their area approaches launch.",
        }}
        footerNote="Thank you for joining the early SLYDE network."
        actions={[
          { href: "/faq", label: "Read Slyder FAQ", variant: "secondary" },
          { href: "/", label: "Return Home", variant: "primary" },
        ]}
      />
    </section>
  );
}
