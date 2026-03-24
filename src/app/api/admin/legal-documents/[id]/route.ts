import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { getLegalDocumentById, updateLegalDocument } from "@/modules/legal/services/legal-document.service";
import { updateLegalDocumentSchema } from "@/modules/legal/schemas/legal.schemas";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await context.params;
  const detail = await getLegalDocumentById(id);
  if (!detail.document) {
    return NextResponse.json({ error: "Legal document not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const json = await request.json();
  const parsed = updateLegalDocumentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { id } = await context.params;
    const document = await updateLegalDocument(id, { ...parsed.data, updatedBy: adminContext.user.id });
    return NextResponse.json({ document, id: document.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 400 });
  }
}
