import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { archiveLegalDocument } from "@/modules/legal/services/legal-document.service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;
  try {
    const { id } = await context.params;
    const document = await archiveLegalDocument(id, adminContext.user.id);
    return NextResponse.json(document);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Archive failed" }, { status: 400 });
  }
}
