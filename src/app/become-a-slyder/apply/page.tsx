import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MultiStepForm } from "@/components/site/multi-step-form";
import { PaymentInfoCard } from "@/components/site/payment-info-card";
import { SectionHeading } from "@/components/site/section-heading";
import { buildMetadata } from "@/lib/metadata";
import { findLeadById } from "@/modules/leads/repositories/slyder-lead.repository";

export const metadata: Metadata = buildMetadata(
  "Apply as a Slyder",
  "Complete the multi-step SLYDE application flow for courier onboarding, approval, activation, and readiness.",
  "/become-a-slyder/apply",
);

export default async function SlyderApplyPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const leadId = typeof params.leadId === "string" ? params.leadId : null;
  const lead = leadId ? await findLeadById(leadId).catch(() => null) : null;

  if (!leadId || !lead) {
    redirect("/join/slyder");
  }

  if (!lead.applicationInviteUnlocked) {
    redirect(`/join/slyder/status?leadId=${encodeURIComponent(lead.id)}`);
  }

  return (
    <section className="section-shell py-10 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div className="space-y-5 lg:sticky lg:top-28">
          <SectionHeading
            eyebrow="Slyder Application"
            title="Apply through a structured onboarding flow"
            description="This application captures the information operations needs to review, verify, approve, and position you for launch in your area."
          />
          <div className="dark-panel p-6">
            <h2 className="text-xl font-semibold text-white">What to expect after you apply</h2>
            <div className="mt-5 grid gap-3">
              {[
                "You will receive a WhatsApp confirmation message and a confirmation email after submission.",
                "SLYDE reviews applications region by region as the network builds toward launch.",
                "Approval does not mean immediate work. It leads to app access, setup, and readiness steps.",
                "Joining now helps position you early in the founding SLYDE network for your area.",
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <PaymentInfoCard
            sectionId="become-slyder-apply-digital-payout-support"
            title="Digital payout support"
            body="SLYDE is building modern payout and payment-support workflows to help Slyders operate with stronger earnings visibility and safer errand handling. Full setup details are provided during onboarding, so you can focus on your application first."
          />
        </div>
        <div>
          <MultiStepForm leadId={leadId} />
        </div>
      </div>
    </section>
  );
}
