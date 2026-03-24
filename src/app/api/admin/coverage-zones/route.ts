import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { listCoverageZones } from "@/modules/admin/services/admin-control-tower.service";

export async function GET() {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const zones = await listCoverageZones();
  return NextResponse.json({ items: zones });
}
