import { MerchantPageHeader } from "@/components/merchant/layout/merchant-page-header";
import { MerchantSettingsForm } from "@/components/merchant/settings/merchant-settings-form";
import { getMerchantSettings } from "@/modules/merchant-ops/services/merchant-settings.service";
import { getMerchantSessionOrRedirect } from "@/server/merchant/context";

export default async function MerchantSettingsPage() {
  const session = await getMerchantSessionOrRedirect({ allowRestricted: true });
  const settings = await getMerchantSettings(session.merchantMembership.merchantId);

  return (
    <div className="space-y-6">
      <MerchantPageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Keep your merchant profile, notification preferences, and operating defaults aligned with how your team actually runs dispatch."
      />
      <MerchantSettingsForm
        initial={{
          lead: settings.lead,
          application: settings.application,
          integrationProfile: settings.integrationProfile,
          preference: settings.preference,
          compliance: {
            businessLicenseStatus: settings.compliance.application.businessLicenseStatus,
            businessLicenseGraceEndsAt: settings.compliance.graceEndsAt,
            businessLicenseRequiredAfterDeliveries: settings.compliance.application.businessLicenseRequiredAfterDeliveries,
            completedDeliveries: settings.compliance.completedDeliveries,
            deliveriesRemaining: settings.compliance.deliveriesRemaining,
            daysRemaining: settings.compliance.daysRemaining,
            isComplianceRestricted: settings.compliance.isRestricted,
          },
        }}
      />
    </div>
  );
}
