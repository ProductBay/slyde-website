import { NextResponse } from "next/server";
import { createFleetLeadSchema } from "@/modules/fleet/schemas/fleet-lead.schema";
import { createFleetLead } from "@/modules/fleet/services/fleet-lead.service";
import { protectPublicRoute } from "@/server/security/public-route-protection";

export async function POST(request: Request) {
  const protection = await protectPublicRoute(request, {
    routeKey: "public_fleet_leads",
    limit: 6,
    windowMs: 10 * 60 * 1000,
    requireTurnstile: false,
  });
  if (protection) return protection;

  const json = await request.json().catch(() => null);
  const parsed = createFleetLeadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await createFleetLead(parsed.data);
    return NextResponse.json(
      {
        ok: true,
        leadId: result.leadId,
        duplicate: result.duplicate,
        message: "Fleet partnership interest submitted successfully.",
      },
      { status: result.duplicate ? 200 : 201 },
    );
  } catch {
    return NextResponse.json({ error: "Could not save your fleet interest. Please try again." }, { status: 500 });
  }
}
