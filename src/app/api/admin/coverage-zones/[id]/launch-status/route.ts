import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { zoneLaunchActionSchema } from "@/modules/onboarding/schemas/onboarding.schemas";
import { updateZoneLaunchState } from "@/modules/admin/services/admin-control-tower.service";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const payload = await request.json();
  const parsed = zoneLaunchActionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { id } = await context.params;
    const zone = await updateZoneLaunchState(id, parsed.data.action);
    return NextResponse.json(zone);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Zone update failed" }, { status: 400 });
  }
}
