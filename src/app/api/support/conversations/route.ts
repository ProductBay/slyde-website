import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminContext, requireMerchantContext } from "@/server/auth/guards";
import {
  createSupportConversationRecord,
  listAllSupportConversations,
  listSupportConversationsForMerchant,
} from "@/modules/support/services/support-conversation.service";
import { appendSupportMessage } from "@/modules/support/services/support-message.service";
import { attachSupportContextSnapshot } from "@/modules/support/services/support-context.service";
import { supportConversationCreateSchema } from "@/modules/support/schemas/support-conversation.schema";

const publicSupportCreateSchema = supportConversationCreateSchema.extend({
  message: z.string().trim().min(1, "Message is required."),
  contact: z
    .object({
      fullName: z.string().trim().optional(),
      email: z.string().trim().optional(),
    })
    .optional(),
});

export async function GET() {
  const admin = await requireAdminContext();
  if (!(admin instanceof Response)) {
    const conversations = await listAllSupportConversations();
    return NextResponse.json(conversations);
  }

  const merchant = await requireMerchantContext({ allowRestricted: true });
  if (!(merchant instanceof Response)) {
    const conversations = await listSupportConversationsForMerchant(merchant.merchantMembership.merchantId);
    return NextResponse.json(conversations);
  }

  return NextResponse.json({ error: "Support authentication required" }, { status: 401 });
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = publicSupportCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid support request" }, { status: 400 });
  }

  const conversation = await createSupportConversationRecord({
    ...parsed.data,
    priority: parsed.data.priority ?? "normal",
  });

  await appendSupportMessage({
    conversationId: conversation.id,
    senderType: "customer",
    body: parsed.data.message,
    messageFormat: "plain_text",
    metadata: parsed.data.contact ? { contact: parsed.data.contact } : undefined,
  });

  if (parsed.data.contact) {
    await attachSupportContextSnapshot({
      conversationId: conversation.id,
      contextType: "public_contact",
      payload: parsed.data.contact,
    });
  }

  return NextResponse.json(conversation, { status: 201 });
}
