import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { getSlyderFunnelMetrics } from "@/modules/leads/services/slyder-funnel.service";

export async function GET() {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  try {
    const metrics = await getSlyderFunnelMetrics();
    return NextResponse.json({ ok: true, metrics });
  } catch (error) {
    console.error("[api/admin/slyder-funnel] GET failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Could not load funnel metrics." }, { status: 500 });
  }
}
