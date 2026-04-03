import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminContext, requireMerchantContext } from "@/server/auth/guards";
import { appendSupportMessage } from "@/modules/support/services/support-message.service";
import { getSupportConversationDetail } from "@/modules/support/services/support-conversation.service";

const replySchema = z.object({
  body: z.string().trim().min(1, "Reply is required."),
});

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
  const parsed = replySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid reply" }, { status: 400 });
  }

  const admin = await requireAdminContext();
  if (!(admin instanceof Response)) {
    const message = await appendSupportMessage({
      conversationId: id,
      senderType: "agent",
      senderId: admin.user.id,
      body: parsed.data.body,
      messageFormat: "plain_text",
    });
    return NextResponse.json(message, { status: 201 });
  }

  const merchant = await requireMerchantContext({ allowRestricted: true });
  if (!(merchant instanceof Response) && detail.conversation.merchantId === merchant.merchantMembership.merchantId) {
    const message = await appendSupportMessage({
      conversationId: id,
      senderType: "customer",
      senderId: merchant.user.id,
      body: parsed.data.body,
      messageFormat: "plain_text",
    });
    return NextResponse.json(message, { status: 201 });
  }

  if (detail.conversation.domain === "public") {
    const message = await appendSupportMessage({
      conversationId: id,
      senderType: "customer",
      body: parsed.data.body,
      messageFormat: "plain_text",
    });
    return NextResponse.json(message, { status: 201 });
  }

  return NextResponse.json({ error: "Support authentication required" }, { status: 401 });
}
