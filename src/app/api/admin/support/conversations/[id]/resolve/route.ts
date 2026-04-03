import { NextResponse } from "next/server";
import { updateSupportConversationStatus } from "@/modules/support/services/support-conversation.service";
import { requireAdminContext } from "@/server/auth/guards";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await requireAdminContext();
  if (context instanceof Response) return context;

  const { id } = await params;
  try {
    const updated = await updateSupportConversationStatus(id, "resolved");
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to resolve support conversation" }, { status: 400 });
  }
}
