import { SuccessState } from "@/components/site/success-state";

export default function ContactSuccessPage() {
  return (
    <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
      <SuccessState
        title="Message received"
        description="Your message has been sent to the SLYDE team. We can now route it to support, partnerships, or onboarding follow-up as needed."
        actions={[
          { href: "/contact", label: "Back to Contact", variant: "secondary" },
          { href: "/", label: "Return Home", variant: "primary" },
        ]}
      />
    </section>
  );
}
