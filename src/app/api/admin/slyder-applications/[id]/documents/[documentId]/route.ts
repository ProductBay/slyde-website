import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { updateDocumentVerificationSchema } from "@/modules/onboarding/schemas/onboarding.schemas";
import { replaceApplicationDocument, updateDocumentVerification } from "@/modules/onboarding/services/onboarding.service";
import { saveUploadedFile } from "@/server/uploads/save-upload";

export async function PATCH(request: Request, context: { params: Promise<{ id: string; documentId: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const json = await request.json();
  const parsed = updateDocumentVerificationSchema.safeParse({
    ...json,
    documentId: json.documentId ?? (await context.params).documentId,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id, documentId } = await context.params;

  try {
    const result = await updateDocumentVerification(
      id,
      documentId,
      parsed.data.verificationStatus,
      { id: adminContext.user.id, fullName: adminContext.user.fullName },
      parsed.data.rejectionReason,
    );
    return NextResponse.json({ ok: true, document: result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string; documentId: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id, documentId } = await context.params;
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A replacement file is required." }, { status: 400 });
  }

  try {
    const saved = await saveUploadedFile(file, `slyder-repairs/${id}/${documentId}`);
    const result = await replaceApplicationDocument(
      id,
      documentId,
      {
        fileUrl: saved.fileUrl,
        storageKey: saved.storageKey,
        fileName: saved.name,
        mimeType: saved.type,
      },
      { id: adminContext.user.id, fullName: adminContext.user.fullName },
    );
    return NextResponse.json({ ok: true, document: result.document });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
