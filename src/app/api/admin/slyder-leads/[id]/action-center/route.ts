import { NextResponse } from "next/server";
import { slyderLeadActionCenterSchema } from "@/modules/leads/schemas/slyder-lead.schema";
import { updateSlyderLeadActionCenter } from "@/modules/leads/services/slyder-lead.service";
import { requireAdminContext } from "@/server/auth/guards";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = slyderLeadActionCenterSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await updateSlyderLeadActionCenter(id, parsed.data, adminContext.user.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[api/admin/slyder-leads/[id]/action-center] POST failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update lead action center." },
      { status: 400 },
    );
  }
}
