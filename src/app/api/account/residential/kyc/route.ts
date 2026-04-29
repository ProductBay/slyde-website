import { NextResponse } from "next/server";
import { getSessionContext } from "@/server/auth/session";
import { saveUploadedFile } from "@/server/uploads/save-upload";
import { residentialKycSchema } from "@/modules/residential-intake/schemas/residential-intake.schemas";
import { submitResidentialKyc, getResidentialKycStatus } from "@/modules/residential-intake/services/residential-kyc.service";

const ALLOWED_ID_DOC_MIME = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

function hasAllowedIdDocExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  return lower.endsWith(".pdf") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp");
}

export async function GET() {
  const session = await getSessionContext();
  if (!session?.user?.isEnabled) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { status, profile } = await getResidentialKycStatus(session.user.id);
  return NextResponse.json({
    status,
    idType: profile?.idType ?? null,
    submittedAt: profile?.submittedAt ?? null,
    reviewNotes: profile?.reviewNotes ?? null,
  });
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session?.user?.isEnabled) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Check if already approved — no re-submission needed
  const existing = await getResidentialKycStatus(session.user.id);
  if (existing.status === "approved") {
    return NextResponse.json({ error: "Your account is already verified" }, { status: 409 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart request" }, { status: 400 });
  }

  const trn = (formData.get("trn") as string | null) ?? "";
  const idType = (formData.get("idType") as string | null) ?? "";
  const idDocFile = formData.get("idDocument");

  const parsed = residentialKycSchema.safeParse({ trn, idType });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  if (!(idDocFile instanceof File)) {
    return NextResponse.json({ error: "ID document file is required" }, { status: 400 });
  }

  if (!ALLOWED_ID_DOC_MIME.has(idDocFile.type) && !hasAllowedIdDocExtension(idDocFile.name)) {
    return NextResponse.json(
      { error: "Only PDF, JPG, PNG, or WEBP files are accepted for ID documents" },
      { status: 415 },
    );
  }

  let uploadedPath: string;
  try {
    const saved = await saveUploadedFile(idDocFile, `resident-kyc/${session.user.id}`);
    uploadedPath = saved.fileUrl;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to upload ID document" },
      { status: 400 },
    );
  }

  const result = await submitResidentialKyc(session.user.id, {
    trn: parsed.data.trn,
    idType: parsed.data.idType as any,
    idDocumentPath: uploadedPath,
  });

  return NextResponse.json(
    { ok: true, profileId: result.profileId, status: result.status },
    { status: 201 },
  );
}
