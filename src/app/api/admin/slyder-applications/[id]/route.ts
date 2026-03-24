import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { getSlyderApplicationDetail } from "@/modules/onboarding/services/onboarding.service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await context.params;

  try {
    const result = await getSlyderApplicationDetail(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 404 });
  }
}
