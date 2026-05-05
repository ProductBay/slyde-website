import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { listSlyderLeadsQuerySchema } from "@/modules/leads/schemas/slyder-lead.schema";
import { listSlyderLeads } from "@/modules/leads/services/slyder-lead.service";

export async function GET(request: Request) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const url = new URL(request.url);
  const parsed = listSlyderLeadsQuerySchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    parish: url.searchParams.get("parish") ?? undefined,
    vehicleType: url.searchParams.get("vehicleType") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const leads = await listSlyderLeads(parsed.data);
  return NextResponse.json({ ok: true, leads });
}
