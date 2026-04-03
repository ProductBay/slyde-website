import { NextResponse } from "next/server";
import { partnerCarrierSchema } from "@/modules/partner-carriers/schemas/partner-carrier.schema";
import { createPartnerCarrierRecord, listActivePartnerCarriers } from "@/modules/partner-carriers/services/partner-carrier.service";
import { listPartnerCarriers } from "@/modules/partner-carriers/repositories/partner-carrier.repository";
import { requireAdminContext } from "@/server/auth/guards";

export async function GET() {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const carriers = await listPartnerCarriers();
  return NextResponse.json({ carriers });
}

export async function POST(request: Request) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const json = await request.json().catch(() => null);
  const parsed = partnerCarrierSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid carrier payload" }, { status: 400 });
  }

  const carrier = await createPartnerCarrierRecord(parsed.data);
  return NextResponse.json({ ok: true, carrier, activeCarriers: await listActivePartnerCarriers() });
}
