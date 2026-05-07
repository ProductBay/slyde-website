import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { listVehicleBrandingLeadsQuerySchema } from "@/modules/vehicle-branding/schemas/vehicle-branding.schema";
import { listVehicleBrandingLeads } from "@/modules/vehicle-branding/services/vehicle-branding.service";

export async function GET(request: Request) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const url = new URL(request.url);
  const parsed = listVehicleBrandingLeadsQuerySchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    parish: url.searchParams.get("parish") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const leads = await listVehicleBrandingLeads(parsed.data);
  return NextResponse.json({ ok: true, leads });
}
