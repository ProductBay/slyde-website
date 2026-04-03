import { NextResponse } from "next/server";
import { requireAdminContext, requireMerchantContext } from "@/server/auth/guards";
import { getSupportConversationDetail } from "@/modules/support/services/support-conversation.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const detail = await getSupportConversationDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Support conversation not found" }, { status: 404 });
  }

  const admin = await requireAdminContext();
  if (!(admin instanceof Response)) {
    return NextResponse.json(detail);
  }

  const merchant = await requireMerchantContext({ allowRestricted: true });
  if (!(merchant instanceof Response) && detail.conversation.merchantId === merchant.merchantMembership.merchantId) {
    return NextResponse.json(detail);
  }

  if (detail.conversation.domain === "public") {
    return NextResponse.json(detail);
  }

  return NextResponse.json({ error: "Support authentication required" }, { status: 401 });
}
