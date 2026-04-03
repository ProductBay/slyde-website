import { MerchantPageHeader } from "@/components/merchant/layout/merchant-page-header";
import { MerchantSupportPanel } from "@/components/merchant/support/merchant-support-panel";
import { getMerchantSupportChannels } from "@/modules/merchant-ops/services/merchant-support.service";
import { listSupportConversationsForMerchant } from "@/modules/support/services/support-conversation.service";
import { getMerchantSessionOrRedirect } from "@/server/merchant/context";

export default async function MerchantSupportPage() {
  const session = await getMerchantSessionOrRedirect({ allowRestricted: true });
  const channels = getMerchantSupportChannels();
  const conversations = await listSupportConversationsForMerchant(session.merchantMembership.merchantId);

  return (
    <div className="space-y-6">
      <MerchantPageHeader
        eyebrow="Support"
        title="Merchant help and escalation"
        description="Use this space for urgent delivery issues, customer-impacting exceptions, and operational questions that need SLYDE support."
      />
      <MerchantSupportPanel
        whatsappUrl={channels.whatsappUrl}
        phoneNumber={channels.phoneNumber}
        conversations={conversations}
      />
    </div>
  );
}
