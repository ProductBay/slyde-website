import { NextResponse } from "next/server";
import { requireAdminContext, requireMerchantContext } from "@/server/auth/guards";
import { supportHandoffSchema } from "@/modules/support/schemas/support-handoff.schema";
import { getSupportConversationDetail, updateSupportConversationStatus } from "@/modules/support/services/support-conversation.service";
import { createSupportHandoffRecord } from "@/modules/support/services/support-handoff.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const detail = await getSupportConversationDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Support conversation not found" }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const parsed = supportHandoffSchema.omit({ conversationId: true }).safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid handoff request" }, { status: 400 });
  }

  const admin = await requireAdminContext();
  if (!(admin instanceof Response)) {
    const handoff = await createSupportHandoffRecord({
      conversationId: id,
      ...parsed.data,
    });
    await updateSupportConversationStatus(id, "waiting_on_agent");
    return NextResponse.json(handoff, { status: 201 });
  }

  const merchant = await requireMerchantContext({ allowRestricted: true });
  if (!(merchant instanceof Response) && detail.conversation.merchantId === merchant.merchantMembership.merchantId) {
    const handoff = await createSupportHandoffRecord({
      conversationId: id,
      ...parsed.data,
    });
    await updateSupportConversationStatus(id, "waiting_on_agent");
    return NextResponse.json(handoff, { status: 201 });
  }

  return NextResponse.json({ error: "Support authentication required" }, { status: 401 });
}
