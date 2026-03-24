import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { requestDocumentsSchema } from "@/modules/onboarding/schemas/onboarding.schemas";
import { requestApplicationDocuments } from "@/modules/onboarding/services/onboarding.service";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const json = await request.json();
  const parsed = requestDocumentsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await context.params;

  try {
    const result = await requestApplicationDocuments(id, parsed.data, {
      id: adminContext.user.id,
      fullName: adminContext.user.fullName,
    });
    return NextResponse.json({ ok: true, application: result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
