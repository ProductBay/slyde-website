import { SuccessState } from "@/components/site/success-state";

export default function ApiRequestSuccessPage() {
  return (
    <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
      <SuccessState
        title="API request received"
        description="Your request has been added to the SLYDE partner pipeline. The next step is an integration discussion around delivery creation, status events, proof of delivery, and implementation fit."
        actions={[
          { href: "/api-integrations", label: "Back to API Page", variant: "secondary" },
          { href: "/", label: "Return Home", variant: "primary" },
        ]}
      />
    </section>
  );
}
