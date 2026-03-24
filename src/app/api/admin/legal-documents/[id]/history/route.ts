import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { getLegalDocumentById } from "@/modules/legal/services/legal-document.service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await context.params;
  const detail = await getLegalDocumentById(id);
  if (!detail.document) {
    return NextResponse.json({ error: "Legal document not found" }, { status: 404 });
  }
  return NextResponse.json({ history: detail.history });
}
