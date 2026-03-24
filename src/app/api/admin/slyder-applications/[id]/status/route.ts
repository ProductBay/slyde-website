import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { updateApplicationStatusSchema } from "@/modules/onboarding/schemas/onboarding.schemas";
import { updateApplicationStatus } from "@/modules/onboarding/services/onboarding.service";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const json = await request.json();
  const parsed = updateApplicationStatusSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await context.params;

  try {
    const result = await updateApplicationStatus(id, parsed.data.status, parsed.data.reviewNotes, {
      id: adminContext.user.id,
      fullName: adminContext.user.fullName,
    });
    return NextResponse.json({ ok: true, application: result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
