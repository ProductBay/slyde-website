import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { createLegalDocumentDraft, listLegalDocuments } from "@/modules/legal/services/legal-document.service";
import { createLegalDocumentSchema, legalDocumentListQuerySchema } from "@/modules/legal/schemas/legal.schemas";

export async function GET(request: Request) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const url = new URL(request.url);
  const parsed = legalDocumentListQuerySchema.safeParse({
    category: url.searchParams.get("category") ?? undefined,
    documentType: url.searchParams.get("documentType") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    active: url.searchParams.get("active") ?? undefined,
    actorScope: url.searchParams.get("actorScope") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const items = await listLegalDocuments(parsed.data);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const json = await request.json();
  const parsed = createLegalDocumentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const document = await createLegalDocumentDraft({
    ...parsed.data,
    createdBy: adminContext.user.id,
  });
  return NextResponse.json(document, { status: 201 });
}
