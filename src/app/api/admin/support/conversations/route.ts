import { NextResponse } from "next/server";
import { listAllSupportConversations } from "@/modules/support/services/support-conversation.service";
import { requireAdminContext } from "@/server/auth/guards";

export async function GET() {
  const context = await requireAdminContext();
  if (context instanceof Response) return context;

  const conversations = await listAllSupportConversations();
  return NextResponse.json(conversations);
}
