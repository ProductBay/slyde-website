import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { getCoverageZoneDetail } from "@/modules/admin/services/admin-control-tower.service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  try {
    const { id } = await context.params;
    const zone = await getCoverageZoneDetail(id);
    return NextResponse.json(zone);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Zone not found" }, { status: 404 });
  }
}
