import { redirect } from "next/navigation";
import { enforceMerchantBusinessLicenseCompliance } from "@/modules/merchant-ops/services/merchant-business-license.service";
import { getSessionContext } from "@/server/auth/session";
import { readPersistenceStore } from "@/server/persistence";

export async function getMerchantSessionOrRedirect(options?: { allowRestricted?: boolean }) {
  const session = await getSessionContext();
  if (
    !session ||
    !session.user.isEnabled ||
    session.user.accountStatus !== "active" ||
    session.user.userType !== "merchant" ||
    !session.user.roles.some((role) => role.startsWith("merchant_"))
  ) {
    redirect("/merchant/login");
  }

  const store = await readPersistenceStore();
  const membership = store.merchantTeamMembers.find((item) => item.userId === session.user.id && item.status === "active");
  if (!membership) {
    redirect("/merchant/login");
  }

  const compliance = await enforceMerchantBusinessLicenseCompliance(membership.merchantId);
  if (compliance.isRestricted && !options?.allowRestricted) {
    redirect("/merchant/settings?compliance=required");
  }

  return {
    ...session,
    merchantMembership: membership,
    merchantCompliance: compliance,
  };
}
