import { NextResponse } from "next/server";
import { z } from "zod";
import { assignSupportConversation, getSupportConversation } from "@/modules/support/services/support-conversation.service";
import { requireAdminContext } from "@/server/auth/guards";

const assignSchema = z.object({
  assignedAgentId: z.string().trim().optional(),
  assignedTeam: z.string().trim().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await requireAdminContext();
  if (context instanceof Response) return context;

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = assignSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid assignment" }, { status: 400 });
  }

  const conversation = await getSupportConversation(id);
  if (!conversation) {
    return NextResponse.json({ error: "Support conversation not found" }, { status: 404 });
  }

  const updated = await assignSupportConversation({
    conversationId: id,
    assignedAgentId: parsed.data.assignedAgentId ?? context.user.id,
    assignedTeam: parsed.data.assignedTeam ?? conversation.assignedTeam ?? "general_support",
    actorId: context.user.id,
  });

  return NextResponse.json(updated);
}
